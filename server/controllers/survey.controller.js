import surveyService from '../services/survey.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

export const getSurveys = async (req, res, next) => {
  try {
    const { status } = req.query;
    const surveys = await surveyService.getAllSurveys(status);
    return sendSuccess(res, 200, 'Site surveys retrieved successfully', surveys, {
      total: surveys.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getSurveyById = async (req, res, next) => {
  try {
    const survey = await surveyService.getSurveyById(req.params.id);
    return sendSuccess(res, 200, 'Survey retrieved successfully', survey);
  } catch (error) {
    next(error);
  }
};

export const createSurvey = async (req, res, next) => {
  try {
    const { customer, auditorName } = req.body;
    if (!customer || !auditorName) {
      return sendError(res, 400, 'Customer and Auditor Name are required');
    }
    const survey = await surveyService.createSurvey(req.body);
    return sendSuccess(res, 201, 'Survey created successfully', survey);
  } catch (error) {
    next(error);
  }
};

export const updateSurvey = async (req, res, next) => {
  try {
    const survey = await surveyService.updateSurvey(req.params.id, req.body);
    return sendSuccess(res, 200, 'Survey updated successfully', survey);
  } catch (error) {
    next(error);
  }
};

export const deleteSurvey = async (req, res, next) => {
  try {
    const survey = await surveyService.deleteSurvey(req.params.id);
    return sendSuccess(res, 200, 'Survey deleted successfully', survey);
  } catch (error) {
    next(error);
  }
};
