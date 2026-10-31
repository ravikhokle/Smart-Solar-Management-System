import { Router } from 'express';
import * as ctrl from '../controllers/installation.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();
router.use(protect);

router.get('/technicians', authorize('admin', 'sales_executive', 'technician'), ctrl.listTechnicians);
router.post('/technicians', authorize('admin'), ctrl.createTechnician);
router.get('/technicians/:id', authorize('admin', 'technician'), ctrl.getTechnician);
router.patch('/technicians/:id', authorize('admin'), ctrl.updateTechnician);
router.delete('/technicians/:id', authorize('admin'), ctrl.deleteTechnician);

router.get('/', authorize('admin', 'sales_executive', 'technician'), ctrl.listInstallations);
router.post('/', authorize('admin', 'sales_executive'), ctrl.schedule);
router.get('/:id', authorize('admin', 'sales_executive', 'technician'), ctrl.getInstallation);
router.patch('/:id', authorize('admin', 'technician'), upload.array('photographs', 8), ctrl.updateInstallation);
router.get('/:id/report', authorize('admin', 'sales_executive', 'technician'), ctrl.reportPdf);

export default router;
