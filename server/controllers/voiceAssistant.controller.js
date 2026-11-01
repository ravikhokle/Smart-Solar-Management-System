import * as svc from '../services/voiceAssistant.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created } from '../utils/response.js';
import { env } from '../config/env.js';

export const getConfig = asyncHandler(async (_req, res) => {
  const config = svc.getAssistantConfig();
  ok(res, config, 'Voice assistant configuration');
});

export const getSignedUrl = asyncHandler(async (_req, res) => {
  const data = await svc.getSignedUrl();
  ok(res, data, 'Signed URL generated');
});

export const createEnquiry = asyncHandler(async (req, res) => {
  const idempotencyKey = req.idempotencyKey || req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
  const result = await svc.processVoiceEnquiry(req.body, { idempotencyKey });
  created(res, result, result.message || 'Enquiry successfully created');
});

export const startConversation = asyncHandler(async (req, res) => {
  const conversation = await svc.logConversationStart(req.body);
  ok(res, { success: true, conversationId: conversation?.conversationId }, 'Conversation started');
});

export const endConversation = asyncHandler(async (req, res) => {
  const conversation = await svc.logConversationEnd(req.body);
  ok(res, { success: true, conversationId: conversation?.conversationId }, 'Conversation ended');
});

export const handleWebhook = asyncHandler(async (req, res) => {
  const signatureHeader = req.headers['elevenlabs-signature'] || req.headers['ElevenLabs-Signature'];
  const rawBody = JSON.stringify(req.body);

  if (env.elevenLabs.webhookSecret) {
    const isValid = svc.verifyWebhookSignature(rawBody, signatureHeader, env.elevenLabs.webhookSecret);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid ElevenLabs webhook signature' });
    }
  }

  // Handle post-call webhook or tool execution event
  const event = req.body;
  if (event.type === 'post_call_transcription' || event.type === 'conversation_ended') {
    const convData = event.data || event;
    await svc.logConversationEnd({
      conversationId: convData.conversation_id,
      durationSeconds: convData.call_duration_secs || convData.duration_seconds || 0,
      language: convData.language || 'en',
      status: 'completed',
      transcript: convData.transcript || [],
    });
  }

  // If ElevenLabs triggers a webhook tool directly
  if (event.tool_name === 'create_solar_enquiry' || event.parameters?.customerName) {
    const idempotencyKey = req.idempotencyKey || req.headers['idempotency-key'] || event.tool_call_id;
    const result = await svc.processVoiceEnquiry(event, { idempotencyKey });
    return res.status(200).json(result);
  }

  res.status(200).json({ success: true, message: 'Webhook event processed' });
});
