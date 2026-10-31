import * as svc from '../services/enquiry.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => {
  const data = await svc.listEnquiries(req.query);
  ok(res, data.items, 'Enquiries', data.meta);
});

export const create = asyncHandler(async (req, res) => {
  const item = await svc.createEnquiry(req.user, req.body);
  created(res, item, 'Enquiry created');
});

export const get = asyncHandler(async (req, res) => {
  ok(res, await svc.getEnquiry(req.params.id));
});

export const update = asyncHandler(async (req, res) => {
  ok(res, await svc.updateEnquiry(req.user, req.params.id, req.body), 'Enquiry updated');
});

export const convert = asyncHandler(async (req, res) => {
  ok(res, await svc.convertToSurvey(req.user, req.params.id, req.body), 'Site survey created');
});
