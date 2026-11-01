import crypto from 'crypto';
import { Customer } from '../models/Customer.js';
import { Enquiry } from '../models/Enquiry.js';
import { VoiceConversation } from '../models/VoiceConversation.js';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';
import { writeAudit } from './audit.service.js';
import { notifyUsers } from './notification.service.js';
import { User } from '../models/User.js';

/**
 * Sanitizes string input by stripping dangerous tags and control characters
 */
function sanitizeString(str, maxLength = 200) {
  if (!str) return '';
  return String(str)
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Strip control chars
    .trim()
    .slice(0, maxLength);
}

/**
 * Normalizes system type input to 'on_grid' or 'off_grid'
 */
function normalizeSystemType(type) {
  if (!type) return 'on_grid';
  const clean = String(type).trim().toLowerCase().replace(/[\s-]/g, '_');
  if (clean.includes('off')) return 'off_grid';
  if (clean.includes('on')) return 'on_grid';
  return 'on_grid';
}

/**
 * Normalizes capacity input to an integer between 1 and 5 kW
 */
function normalizeCapacity(cap) {
  if (typeof cap === 'number' && !isNaN(cap)) {
    return Math.min(5, Math.max(1, Math.round(cap)));
  }
  if (!cap) return 3;
  const match = String(cap).match(/\d+(\.\d+)?/);
  if (match) {
    const val = parseFloat(match[0]);
    return Math.min(5, Math.max(1, Math.round(val)));
  }
  return 3;
}

/**
 * Validates and normalizes 10-digit Indian phone number
 */
function normalizePhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
    return digits;
  }
  if (digits.length > 10 && digits.startsWith('91')) {
    const sliced = digits.slice(-10);
    if (/^[6-9]\d{9}$/.test(sliced)) return sliced;
  }
  if (digits.length >= 10 && digits.length <= 15) {
    return digits;
  }
  return null;
}

/**
 * Generates an ephemeral signed URL from ElevenLabs Conversational AI
 */
export async function getSignedUrl() {
  if (!env.elevenLabs.apiKey || !env.elevenLabs.agentId) {
    throw new ApiError(
      400,
      'ElevenLabs credentials not configured. Please set ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID in server/.env.'
    );
  }

  const url = `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(
    env.elevenLabs.agentId
  )}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'xi-api-key': env.elevenLabs.apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ElevenLabs signed URL error:', response.status, errorText);
    throw new ApiError(
      502,
      `Failed to obtain signed URL from ElevenLabs (${response.status}): ${errorText || response.statusText}`
    );
  }

  const data = await response.json();
  return {
    signedUrl: data.signed_url,
    agentId: env.elevenLabs.agentId,
  };
}

/**
 * Returns public configuration for client voice assistant
 */
export function getAssistantConfig() {
  return {
    configured: Boolean(env.elevenLabs.agentId),
    agentId: env.elevenLabs.agentId || '',
    requiresSignedUrl: Boolean(env.elevenLabs.apiKey),
  };
}

/**
 * Processes and validates a solar enquiry submitted by the voice assistant
 * Meets all 11 backend integration requirements.
 */
export async function processVoiceEnquiry(rawPayload, context = {}) {
  // Support both direct parameter body and ElevenLabs wrapped tool-call payload
  const payload = rawPayload.parameters || rawPayload;

  // 1. Require Customer Verbal Confirmation
  // The assistant must summarize details and obtain customer confirmation before calling this endpoint
  const isConfirmed =
    payload.customerConfirmed === true ||
    payload.confirmed === true ||
    payload.customerConfirmation === true ||
    payload.confirmation === 'confirmed' ||
    String(payload.customerConfirmed).toLowerCase() === 'true';

  if (!isConfirmed) {
    throw new ApiError(
      400,
      'Customer confirmation required: The voice assistant must summarize the enquiry details and receive explicit customer confirmation before submitting.'
    );
  }

  // 2. Extract conversation & idempotency identifiers
  const conversationId = sanitizeString(
    rawPayload.conversation_id || payload.conversationId || rawPayload.conversationId || '',
    100
  );
  const idempotencyKey = sanitizeString(
    context.idempotencyKey ||
      rawPayload.tool_call_id ||
      payload.tool_call_id ||
      payload.idempotencyKey ||
      conversationId ||
      '',
    120
  );

  // 3. Idempotency Check: Prevent duplicate submissions
  if (idempotencyKey) {
    const existingLog = await VoiceConversation.findOne({
      idempotencyKey,
      submissionStatus: 'success',
      enquiry: { $exists: true, $ne: null },
    }).populate('enquiry');

    if (existingLog && existingLog.enquiry) {
      return {
        success: true,
        enquiryId: existingLog.enquiry._id,
        submissionStatus: 'confirmed',
        customerName: existingLog.metadata?.customerName || 'Valued Customer',
        systemType: existingLog.enquiry.systemType,
        capacity: `${existingLog.enquiry.expectedCapacityKw}kW`,
        isDuplicate: true,
        message: 'Your solar enquiry has already been successfully registered. Our team will contact you shortly.',
      };
    }
  }

  // 4. Validate & Sanitize Customer Name
  const rawName = payload.customerName || payload.name || '';
  const fullName = sanitizeString(rawName, 100);
  if (!fullName || fullName.length < 2) {
    throw new ApiError(400, 'Invalid customer name: Must be at least 2 characters.');
  }

  // 5. Validate & Sanitize Phone Number
  const rawPhone = payload.phone || payload.phoneNumber || payload.mobile;
  const phone = normalizePhone(rawPhone);
  if (!phone) {
    throw new ApiError(
      400,
      'A valid contact phone number (10 digits) is required to register the solar enquiry.'
    );
  }

  // 6. Validate & Sanitize City
  const rawCity = payload.city || payload.location || '';
  const city = sanitizeString(rawCity, 60);
  if (!city || city.length < 2) {
    throw new ApiError(400, 'City or property location is required (at least 2 characters).');
  }

  // 7. Validate & Normalize System Type (On-Grid vs Off-Grid)
  const systemType = normalizeSystemType(payload.systemType);

  // 8. Validate & Normalize Capacity (1kW to 5kW)
  const expectedCapacityKw = normalizeCapacity(payload.capacity || payload.expectedCapacityKw);

  // 9. Validate Optional Email
  let email = undefined;
  if (payload.email) {
    const candidateEmail = sanitizeString(payload.email, 120).toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateEmail)) {
      email = candidateEmail;
    }
  }

  // 10. Optional Monthly Electricity Bill
  let electricityConsumption = '';
  const monthlyBill = payload.monthlyBill || payload.electricityBill || payload.bill;
  if (monthlyBill) {
    const billNum = String(monthlyBill).replace(/[^\d.]/g, '');
    electricityConsumption = billNum ? `Avg ₹${billNum}/month` : sanitizeString(monthlyBill, 50);
  }

  // 11. Optional Additional Notes
  const additionalNotes = sanitizeString(
    payload.additionalNotes || payload.notes || payload.requirements || '',
    500
  );

  // 12. Find or Create Customer according to existing business rules
  let customer = await Customer.findOne({ phone });
  if (!customer && email) {
    customer = await Customer.findOne({ email });
  }

  if (!customer) {
    customer = await Customer.create({
      fullName,
      phone,
      email: email || undefined,
      address: `${city}, Property Location`,
      city,
      state: 'Maharashtra',
      pinCode: '411001',
      customerType: 'residential',
      notes: 'Customer created via HeliosFlow AI Voice Assistant',
    });
  } else {
    // If the customer already exists, synchronize their profile with the confirmed caller details
    let isChanged = false;
    if (fullName && fullName.length >= 2 && customer.fullName !== fullName) {
      customer.fullName = fullName;
      isChanged = true;
    }
    if (email && customer.email !== email) {
      customer.email = email;
      isChanged = true;
    }
    if (city && (!customer.city || customer.city !== city)) {
      customer.city = city;
      if (!customer.address || customer.address.includes('Property Location')) {
        customer.address = `${city}, Property Location`;
      }
      isChanged = true;
    }
    if (isChanged) {
      await customer.save();
    }
  }

  // 13. Pre-check for duplicate active enquiry within 5 minutes
  const recentEnquiry = await Enquiry.findOne({
    customer: customer._id,
    expectedCapacityKw,
    status: { $in: ['new', 'assigned', 'in_progress'] },
    createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
  });

  if (recentEnquiry) {
    return {
      success: true,
      enquiryId: recentEnquiry._id,
      submissionStatus: 'confirmed',
      customerName: customer.fullName,
      systemType: recentEnquiry.systemType,
      capacity: `${recentEnquiry.expectedCapacityKw}kW`,
      isDuplicate: true,
      message: 'Your solar enquiry is already active in our system. Our team will contact you shortly.',
    };
  }

  // 14. Assign to available sales executive or administrator
  const salesExec = await User.findOne({
    role: { $in: ['sales_executive', 'admin'] },
    isActive: true,
  }).sort({ createdAt: 1 });

  // 15. Create genuine Enquiry in MongoDB
  const combinedNotes = [
    'Source: AI Voice Assistant',
    `Caller: ${fullName}`,
    city ? `Location: ${city}` : null,
    additionalNotes ? `Notes: ${additionalNotes}` : null,
    conversationId ? `Conversation ID: ${conversationId}` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  const enquiry = await Enquiry.create({
    customer: customer._id,
    systemType,
    expectedCapacityKw,
    electricityConsumption,
    source: 'ai_voice_assistant',
    status: salesExec ? 'assigned' : 'new',
    assignedTo: salesExec?._id,
    notes: combinedNotes,
    conversationId: conversationId || undefined,
  });

  // 16. Log conversation session and idempotency record
  if (conversationId || idempotencyKey) {
    const convFilter = conversationId ? { conversationId } : { idempotencyKey };
    await VoiceConversation.findOneAndUpdate(
      convFilter,
      {
        conversationId: conversationId || `conv_${Date.now()}`,
        idempotencyKey: idempotencyKey || undefined,
        customer: customer._id,
        enquiry: enquiry._id,
        enquirySubmitted: true,
        submissionStatus: 'success',
        metadata: {
          customerName: customer.fullName,
          phone: customer.phone,
          city,
          systemType,
          capacityKw: expectedCapacityKw,
        },
      },
      { upsert: true, new: true }
    );
  }

  // 17. Audit and Notifications
  await writeAudit({
    actor: salesExec?._id || customer._id,
    action: 'enquiry.create_voice_assistant',
    entityType: 'Enquiry',
    entityId: enquiry._id,
    details: { phone, customerName: customer.fullName, systemType, capacityKw: expectedCapacityKw },
  });

  if (salesExec) {
    await notifyUsers({
      userIds: [salesExec._id],
      title: 'New AI Voice Enquiry Received',
      body: `Prospective customer ${customer.fullName} (${city}) enquired for a ${expectedCapacityKw}kW ${systemType.replace('_', '-')} rooftop solar system.`,
      link: `/enquiries/${enquiry._id}`,
    });
  }

  // 18. Return clean response without leaking sensitive internal customer details
  return {
    success: true,
    enquiryId: enquiry._id,
    submissionStatus: 'confirmed',
    customerName: customer.fullName,
    systemType: enquiry.systemType,
    capacity: `${enquiry.expectedCapacityKw}kW`,
    message: 'Your solar enquiry has been successfully registered. Our solar team will contact you soon.',
  };
}

/**
 * Logs conversation start
 */
export async function logConversationStart({ conversationId, language = 'en', metadata = {} }) {
  if (!conversationId) return null;

  return VoiceConversation.findOneAndUpdate(
    { conversationId },
    {
      conversationId,
      startTime: new Date(),
      status: 'active',
      language,
      metadata,
    },
    { upsert: true, new: true }
  );
}

/**
 * Logs conversation end with duration
 */
export async function logConversationEnd({
  conversationId,
  durationSeconds = 0,
  language = 'en',
  status = 'completed',
  submissionStatus = 'none',
  submissionError = '',
  transcript = [],
}) {
  if (!conversationId) return null;

  const update = {
    endTime: new Date(),
    durationSeconds: Number(durationSeconds) || 0,
    language,
    status,
    messagesCount: Array.isArray(transcript) ? transcript.length : 0,
  };

  // Only update submissionStatus if provided and not default 'none'
  if (submissionStatus && submissionStatus !== 'none') {
    update.submissionStatus = submissionStatus;
  }
  if (submissionError) {
    update.submissionError = submissionError;
  }

  if (env.storeVoiceTranscripts && Array.isArray(transcript) && transcript.length > 0) {
    update.transcript = transcript.map((m) => ({
      role: m.role || 'user',
      message: m.message || m.text || '',
      timestamp: m.timestamp || new Date(),
    }));
  }

  return VoiceConversation.findOneAndUpdate({ conversationId }, update, {
    upsert: true,
    new: true,
  });
}

/**
 * Verifies ElevenLabs webhook HMAC-SHA256 signature
 */
export function verifyWebhookSignature(rawBody, signatureHeader, secret) {
  if (!secret) return true;
  if (!signatureHeader) return false;

  const parts = signatureHeader.split(',');
  let timestamp = '';
  let sig = '';

  for (const part of parts) {
    const [k, v] = part.trim().split('=');
    if (k === 't') timestamp = v;
    if (k === 'v1' || k === 'v0') sig = v;
  }

  if (!timestamp || !sig) return false;

  const now = Math.floor(Date.now() / 1000);
  const reqTime = parseInt(timestamp, 10);
  if (isNaN(reqTime) || Math.abs(now - reqTime) > 1800) {
    return false;
  }

  const payloadToSign = `${timestamp}.${rawBody}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadToSign);
  const computedSig = hmac.digest('hex');

  return crypto.timingSafeEqual(Buffer.from(computedSig, 'hex'), Buffer.from(sig, 'hex'));
}
