import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getDashboardMetrics,
} from '../controllers/project.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/metrics', protect, getDashboardMetrics);

router
  .route('/')
  .get(protect, getProjects)
  .post(protect, authorize('admin', 'project_manager'), createProject);

router
  .route('/:id')
  .get(protect, getProjectById)
  .put(protect, authorize('admin', 'project_manager'), updateProject)
  .delete(protect, authorize('admin'), deleteProject);

export default router;
