import express from 'express';
import { getDBStatus } from '../config/db.js';
import { sendSuccess } from '../utils/response.util.js';

const router = express.Router();

router.get('/', (req, res) => {
  const dbStatus = getDBStatus();
  return sendSuccess(res, 200, 'Solar Management API is healthy and operational', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: '1.0.0',
    service: 'HeliosFlow Solar Engine',
  });
});

export default router;
