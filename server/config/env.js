import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEnv = path.join(__dirname, '..', '.env');
const rootEnv = path.join(__dirname, '..', '..', '.env');

dotenv.config({ path: serverEnv });
dotenv.config({ path: rootEnv });

function required(name, value) {
  if (!value || String(value).trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadEnv() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const jwtSecret = process.env.JWT_SECRET;
  const errors = [];

  if (!mongoUri) errors.push('MONGODB_URI (or MONGO_URI)');
  if (!jwtSecret) errors.push('JWT_SECRET');

  if (errors.length) {
    throw new Error(
      `Invalid server configuration. Set these in server/.env:\n- ${errors.join('\n- ')}`
    );
  }

  const smtpUser = process.env.SMTP_USER || process.env.SMTPEMAIL || '';
  const smtpPass = process.env.SMTP_PASS || process.env.SMTPPASS || '';

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT || 5000),
    mongoUri: required('MONGODB_URI', mongoUri),
    mongoDbName: process.env.MONGODB_DB || 'solar_management',
    jwtSecret: required('JWT_SECRET', jwtSecret),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || '7d',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      user: smtpUser,
      pass: smtpPass,
      from: process.env.SMTP_FROM || smtpUser || 'HeliosFlow <noreply@localhost>',
    },
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    serverUrl: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`,
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID || '',
      keySecret: process.env.RAZORPAY_KEY_SECRET || '',
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
      mode: process.env.RAZORPAY_MODE || 'test',
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    },
    emailVerificationEnabled: String(process.env.EMAIL_VERIFICATION_ENABLED || 'false') === 'true',
  };
}

export const env = loadEnv();
