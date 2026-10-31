import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as ctrl from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

router.post('/login', limiter, ...ctrl.login);
router.post('/forgot-password', limiter, ...ctrl.forgot);
router.post('/reset-password', ...ctrl.reset);
router.get('/verify-email', ctrl.verify);
router.get('/me', protect, ctrl.me);
router.patch('/profile', protect, ctrl.updateProfile);
router.post('/change-password', protect, ...ctrl.changePassword);

export default router;
