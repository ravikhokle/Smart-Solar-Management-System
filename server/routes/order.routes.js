import { Router } from 'express';
import * as ctrl from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect, authorize('admin', 'sales_executive', 'warehouse_manager', 'technician'));
router.get('/', ctrl.list);
router.post('/', authorize('admin', 'sales_executive'), ctrl.createFromQuote);
router.get('/:id', ctrl.get);
router.post('/:id/sync-payment', ctrl.syncPayment);
router.patch('/:id', authorize('admin', 'sales_executive'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);
export default router;
