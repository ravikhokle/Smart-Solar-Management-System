import { Router } from 'express';
import * as ctrl from '../controllers/finance.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect);

router.get('/dashboard', authorize('admin', 'sales_executive', 'warehouse_manager', 'technician'), ctrl.dashboard);
router.get('/report', authorize('admin'), ctrl.report);
router.get('/report.csv', authorize('admin'), ctrl.reportCsv);
router.get('/report.pdf', authorize('admin'), ctrl.reportPdf);
router.get('/expenses', authorize('admin'), ctrl.expenses);
router.post('/expenses', authorize('admin'), ctrl.createExpense);
router.get('/subsidies', authorize('admin', 'sales_executive'), ctrl.subsidies);
router.post('/subsidies', authorize('admin', 'sales_executive'), ctrl.createSubsidy);
router.get('/subsidies/:id', authorize('admin', 'sales_executive'), ctrl.getSubsidy);
router.patch('/subsidies/:id', authorize('admin', 'sales_executive'), ctrl.updateSubsidy);
router.get('/settings', authorize('admin'), ctrl.settings);
router.patch('/settings', authorize('admin'), ctrl.updateSettings);
router.get('/notifications', ctrl.notifications);
router.patch('/notifications/:id/read', ctrl.readNotification);

export default router;
