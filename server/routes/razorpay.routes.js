import { Router } from 'express';
import express from 'express';
import { webhook } from '../controllers/razorpay.controller.js';

const router = Router();
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);
export default router;
