import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as ctrl from '../controllers/voiceAssistant.controller.js';
import { verifyVoiceAssistantAuth } from '../middleware/voiceAuth.middleware.js';

const router = Router();

// Rate limiter for session generation and enquiry submission
const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Max 30 enquiry submissions per IP per 15 minutes
  message: {
    success: false,
    message: 'Too many enquiry requests from this IP. Please try again later or contact our team directly.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const sessionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 40, // Max 40 session / token requests per IP per 5 minutes
  message: {
    success: false,
    message: 'Too many connection requests. Please wait a moment before starting a new session.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public endpoints for prospective customers and client voice widget
router.get('/config', ctrl.getConfig);
router.get('/signed-url', sessionLimiter, ctrl.getSignedUrl);

// Dedicated enquiry creation endpoint protected with secret authentication & rate limiting
router.post('/enquiries', enquiryLimiter, verifyVoiceAssistantAuth, ctrl.createEnquiry);

// Conversation session logging
router.post('/conversations/start', sessionLimiter, ctrl.startConversation);
router.post('/conversations/end', ctrl.endConversation);

// Webhook endpoint for ElevenLabs server-side integration
router.post('/webhook', ctrl.handleWebhook);

export default router;
