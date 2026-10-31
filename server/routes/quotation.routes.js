import { Router } from 'express';
import * as ctrl from '../controllers/quotation.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect, authorize('admin', 'sales_executive'));
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/templates', ctrl.templates);
router.post('/templates', authorize('admin'), ctrl.saveTemplate);
router.get('/:id', ctrl.get);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/send', ctrl.send);
router.post('/:id/decision', ctrl.decide);
router.get('/:id/pdf', ctrl.pdf);
export default router;
