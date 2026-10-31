import { Enquiry } from '../models/Enquiry.js';
import { SiteSurvey } from '../models/SiteSurvey.js';
import { ApiError } from '../utils/apiError.js';
import { paginate } from '../utils/query.js';
import { getCustomer } from './customer.service.js';
import { writeAudit } from './audit.service.js';
import { notifyUsers } from './notification.service.js';
import { env } from '../config/env.js';

const populate = [
  { path: 'customer', select: 'fullName phone email city' },
  { path: 'assignedTo', select: 'name email role' },
  { path: 'createdBy', select: 'name' },
];

export async function listEnquiries({ q, status, from, to, page, limit, assignedTo }) {
  const { skip, limit: l, page: p } = paginate({ page, limit });
  const filter = {};
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (from || to) {
    filter.enquiryDate = {};
    if (from) filter.enquiryDate.$gte = new Date(from);
    if (to) filter.enquiryDate.$lte = new Date(to);
  }
  if (q) {
    filter.$or = [];
  }
  let query = Enquiry.find(filter).populate(populate).sort({ createdAt: -1 }).skip(skip).limit(l);
  const [items, total] = await Promise.all([query, Enquiry.countDocuments(filter)]);
  const filtered = q
    ? items.filter((e) => {
        const blob = `${e.customer?.fullName || ''} ${e.customer?.phone || ''} ${e.customer?.email || ''}`.toLowerCase();
        return blob.includes(String(q).toLowerCase());
      })
    : items;
  return { items: filtered, meta: { page: p, limit: l, total } };
}

export async function createEnquiry(actor, payload) {
  await getCustomer(payload.customer);
  const enquiry = await Enquiry.create({
    ...payload,
    assignedTo: payload.assignedTo || (actor.role === 'sales_executive' ? actor._id : undefined),
    status: payload.assignedTo ? 'assigned' : 'new',
    createdBy: actor._id,
  });
  if (enquiry.assignedTo) {
    await notifyUsers({
      userIds: [enquiry.assignedTo],
      title: 'New enquiry assigned',
      body: 'A customer enquiry has been assigned to you.',
      link: `/enquiries/${enquiry._id}`,
      email: { ctaUrl: `${env.clientUrl}/enquiries/${enquiry._id}`, ctaLabel: 'View enquiry' },
    });
  }
  await writeAudit({
    actor: actor._id,
    action: 'enquiry.create',
    entityType: 'Enquiry',
    entityId: enquiry._id,
  });
  return Enquiry.findById(enquiry._id).populate(populate);
}

export async function getEnquiry(id) {
  const enquiry = await Enquiry.findById(id).populate(populate);
  if (!enquiry) throw new ApiError(404, 'Enquiry not found');
  return enquiry;
}

export async function updateEnquiry(actor, id, payload) {
  const enquiry = await Enquiry.findById(id);
  if (!enquiry) throw new ApiError(404, 'Enquiry not found');
  Object.assign(enquiry, payload);
  if (payload.assignedTo) enquiry.status = enquiry.status === 'new' ? 'assigned' : enquiry.status;
  await enquiry.save();
  await writeAudit({
    actor: actor._id,
    action: 'enquiry.update',
    entityType: 'Enquiry',
    entityId: enquiry._id,
  });
  return Enquiry.findById(id).populate(populate);
}

export async function convertToSurvey(actor, enquiryId, extra = {}) {
  const enquiry = await Enquiry.findById(enquiryId);
  if (!enquiry) throw new ApiError(404, 'Enquiry not found');
  const existing = await SiteSurvey.findOne({ enquiry: enquiry._id });
  if (existing) return SiteSurvey.findById(existing._id).populate('customer enquiry surveyor');
  const survey = await SiteSurvey.create({
    customer: enquiry.customer,
    enquiry: enquiry._id,
    surveyor: extra.surveyor || actor._id,
    systemType: enquiry.systemType,
    proposedCapacityKw: enquiry.expectedCapacityKw,
    approvalStatus: 'draft',
    createdBy: actor._id,
    history: [{ status: 'draft', note: 'Created from enquiry', by: actor._id }],
  });
  enquiry.status = 'survey_requested';
  await enquiry.save();
  await writeAudit({
    actor: actor._id,
    action: 'enquiry.convert_survey',
    entityType: 'SiteSurvey',
    entityId: survey._id,
  });
  return SiteSurvey.findById(survey._id).populate('customer enquiry surveyor');
}
