import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function createRawToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function signQuotationResponseToken(quotationId, email) {
  return jwt.sign(
    { quotationId: String(quotationId), email: String(email).toLowerCase(), purpose: 'quotation-response' },
    env.jwtSecret,
    { expiresIn: '30d' }
  );
}

export function verifyQuotationResponseToken(token) {
  const payload = jwt.verify(token, env.jwtSecret);
  if (payload.purpose !== 'quotation-response' || !payload.quotationId || !payload.email) {
    throw new Error('Invalid quotation response token');
  }
  return payload;
}
