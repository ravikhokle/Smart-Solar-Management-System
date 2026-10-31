import { Router } from 'express';
import * as ctrl from '../controllers/payment.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect, authorize('admin', 'sales_executive'));
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.get);
router.get('/:id/receipt', ctrl.receiptPdf);
export default router;
