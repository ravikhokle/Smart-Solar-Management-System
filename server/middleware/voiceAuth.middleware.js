import crypto from 'crypto';
import { env } from '../config/env.js';

/**
 * Dedicated authentication middleware for ElevenLabs webhook / tool calling
 */
export function verifyVoiceAssistantAuth(req, res, next) {
  const configuredSecret = env.elevenLabs.assistantSecret;

  // Extract idempotency key from header if present
  req.idempotencyKey =
    req.headers['idempotency-key'] ||
    req.headers['x-idempotency-key'] ||
    req.body?.idempotencyKey ||
    req.body?.tool_call_id ||
    null;

  // If secret is configured in environment, enforce strict authentication
  if (configuredSecret) {
    const headerSecret = req.headers['x-voice-assistant-secret'];
    const authHeader = req.headers['authorization'];
    const bearerSecret = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const querySecret = req.query?.secret;

    const incomingSecret = headerSecret || bearerSecret || querySecret;

    if (!incomingSecret) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Missing voice assistant secret header (X-Voice-Assistant-Secret or Authorization: Bearer <secret>).',
      });
    }

    try {
      const bufA = Buffer.from(incomingSecret);
      const bufB = Buffer.from(configuredSecret);

      if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Invalid voice assistant secret.',
        });
      }
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Secret verification failed.',
      });
    }
  }

  next();
}

