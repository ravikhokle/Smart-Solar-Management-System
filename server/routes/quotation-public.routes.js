import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as ctrl from '../controllers/quotation-public.controller.js';

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

router.get('/respond', limiter, ctrl.get);
router.post('/respond', limiter, ctrl.respond);

export default router;
