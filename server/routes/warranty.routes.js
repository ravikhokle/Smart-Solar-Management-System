import { Router } from 'express';
import * as ctrl from '../controllers/warranty.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect, authorize('admin', 'sales_executive', 'technician', 'warehouse_manager'));
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.get('/:id/certificate', ctrl.certificate);
export default router;
