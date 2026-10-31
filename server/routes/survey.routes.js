import { Router } from 'express';
import * as ctrl from '../controllers/survey.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();
router.use(protect, authorize('admin', 'sales_executive', 'technician'));
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.patch('/:id', upload.array('photographs', 8), ctrl.update);
router.delete('/:id', authorize('admin', 'sales_executive'), ctrl.remove);
router.post('/:id/decision', authorize('admin', 'sales_executive'), ctrl.decide);
export default router;
