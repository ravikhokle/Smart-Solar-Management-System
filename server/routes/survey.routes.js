import express from 'express';
import {
  getSurveys,
  getSurveyById,
  createSurvey,
  updateSurvey,
  deleteSurvey,
} from '../controllers/survey.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getSurveys)
  .post(protect, authorize('admin', 'project_manager', 'field_engineer'), createSurvey);

router
  .route('/:id')
  .get(protect, getSurveyById)
  .put(protect, authorize('admin', 'project_manager', 'field_engineer'), updateSurvey)
  .delete(protect, authorize('admin'), deleteSurvey);

export default router;
