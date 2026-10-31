import * as svc from '../services/survey.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => {
  const data = await svc.listSurveys(req.query);
  ok(res, data.items, 'Surveys', data.meta);
});

export const get = asyncHandler(async (req, res) => {
  ok(res, await svc.getSurvey(req.params.id));
});

export const update = asyncHandler(async (req, res) => {
  ok(res, await svc.updateSurvey(req.user, req.params.id, req.body, req.files), 'Survey updated');
});

export const decide = asyncHandler(async (req, res) => {
  ok(res, await svc.decideSurvey(req.user, req.params.id, req.body), 'Survey decision saved');
});
