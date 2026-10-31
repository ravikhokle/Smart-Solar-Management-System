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
