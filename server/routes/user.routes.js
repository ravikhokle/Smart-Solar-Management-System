import { Router } from 'express';
import * as ctrl from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect);
router.get('/assignable', authorize('admin', 'sales_executive'), ctrl.list);
router.get('/', authorize('admin'), ctrl.list);
router.post('/', authorize('admin'), ctrl.create);
router.patch('/:id', authorize('admin'), ctrl.update);
router.patch('/:id/active', authorize('admin'), ctrl.setActive);
export default router;
