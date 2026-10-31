import { Router } from 'express';
import * as ctrl from '../controllers/ticket.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect, authorize('admin', 'sales_executive', 'technician'));
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.get);
router.patch('/:id', ctrl.update);
export default router;
