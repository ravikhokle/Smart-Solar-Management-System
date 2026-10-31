import { Router } from 'express';
import * as ctrl from '../controllers/customer.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect, authorize('admin', 'sales_executive', 'technician'));
router.get('/', ctrl.list);
router.get('/duplicates', ctrl.duplicates);
router.post('/', authorize('admin', 'sales_executive'), ctrl.create);
router.get('/:id', ctrl.get);
router.patch('/:id', authorize('admin', 'sales_executive'), ctrl.update);
export default router;
