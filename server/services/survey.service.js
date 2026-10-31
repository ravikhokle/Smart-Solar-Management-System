import { SiteSurvey } from '../models/SiteSurvey.js';
import { ApiError } from '../utils/apiError.js';
import { paginate } from '../utils/query.js';
import { writeAudit } from './audit.service.js';
import { uploadMany } from './upload.service.js';

const populate = [
  { path: 'customer', select: 'fullName phone email address city state pinCode' },
  { path: 'enquiry' },
  { path: 'surveyor', select: 'name email' },
];

export async function listSurveys({ status, page, limit, q }) {
  const { skip, limit: l, page: p } = paginate({ page, limit });
  const filter = {};
  if (status) filter.approvalStatus = status;
  const [items, total] = await Promise.all([
    SiteSurvey.find(filter).populate(populate).sort({ createdAt: -1 }).skip(skip).limit(l),
    SiteSurvey.countDocuments(filter),
  ]);
  const filtered = q
    ? items.filter((s) =>
        `${s.customer?.fullName || ''} ${s.customer?.phone || ''}`.toLowerCase().includes(String(q).toLowerCase())
      )
    : items;
  return { items: filtered, meta: { page: p, limit: l, total } };
}

export async function getSurvey(id) {
  const survey = await SiteSurvey.findById(id).populate(populate);
  if (!survey) throw new ApiError(404, 'Site survey not found');
  return survey;
}

export async function updateSurvey(actor, id, payload, files) {
  const survey = await SiteSurvey.findById(id);
  if (!survey) throw new ApiError(404, 'Site survey not found');
  if (survey.approvalStatus === 'approved') {
    throw new ApiError(400, 'Approved surveys cannot be edited');
  }
  const allowed = [
    'roofAreaSqft',
    'roofDirection',
    'roofTilt',
    'cableDistanceM',
    'roofCondition',
    'availableSpaceSqft',
    'proposedCapacityKw',
    'systemType',
    'technicalObservations',
    'surveyDate',
    'surveyor',
  ];
  for (const key of allowed) {
    if (payload[key] !== undefined) survey[key] = payload[key];
  }
  if (files?.length) {
    const uploaded = await uploadMany(files, 'heliosflow/surveys');
    survey.photographs.push(...uploaded.map((u) => ({ url: u.url, publicId: u.publicId })));
  }
  if (payload.submit) {
    survey.approvalStatus = 'submitted';
    survey.history.push({ status: 'submitted', note: 'Submitted for approval', by: actor._id });
  }
  await survey.save();
  await writeAudit({
    actor: actor._id,
    action: 'survey.update',
    entityType: 'SiteSurvey',
    entityId: survey._id,
  });
  return getSurvey(id);
}

export async function decideSurvey(actor, id, { approve, reason }) {
  const survey = await SiteSurvey.findById(id);
  if (!survey) throw new ApiError(404, 'Site survey not found');
  if (survey.approvalStatus === 'approved') throw new ApiError(400, 'Survey is already approved');
  if (approve) {
    if (!survey.proposedCapacityKw) throw new ApiError(400, 'Proposed capacity is required before approval');
    survey.approvalStatus = 'approved';
    survey.rejectionReason = '';
    survey.history.push({ status: 'approved', note: 'Survey approved', by: actor._id });
  } else {
    if (!reason) throw new ApiError(400, 'Rejection reason is required');
    survey.approvalStatus = 'rejected';
    survey.rejectionReason = reason;
    survey.history.push({ status: 'rejected', note: reason, by: actor._id });
  }
  await survey.save();
  await writeAudit({
    actor: actor._id,
    action: approve ? 'survey.approve' : 'survey.reject',
    entityType: 'SiteSurvey',
    entityId: survey._id,
  });
  return getSurvey(id);
}

export async function deleteSurvey(actor, id) {
  const survey = await SiteSurvey.findById(id);
  if (!survey) throw new ApiError(404, 'Site survey not found');
  const { Quotation } = await import('../models/Quotation.js');
  const quoted = await Quotation.countDocuments({ survey: id });
  if (quoted) throw new ApiError(400, 'Cannot delete a survey that already has quotations');
  await SiteSurvey.findByIdAndDelete(id);
  await writeAudit({ actor: actor._id, action: 'survey.delete', entityType: 'SiteSurvey', entityId: id });
}
