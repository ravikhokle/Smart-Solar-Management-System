import { SubsidyApplication } from '../models/SubsidyApplication.js';
import { ApiError } from '../utils/apiError.js';
import { paginate } from '../utils/query.js';

export async function listSubsidies({ status, page, limit }) {
  const { skip, limit: l, page: p } = paginate({ page, limit });
  const filter = {};
  if (status) filter.applicationStatus = status;
  const [items, total] = await Promise.all([
    SubsidyApplication.find(filter)
      .populate('customer', 'fullName phone')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l),
    SubsidyApplication.countDocuments(filter),
  ]);
  return { items, meta: { page: p, limit: l, total } };
}

export async function createSubsidy(actor, payload) {
  return SubsidyApplication.create({ ...payload, createdBy: actor._id });
}

export async function updateSubsidy(id, payload) {
  const doc = await SubsidyApplication.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
    .populate('customer')
    .populate('order');
  if (!doc) throw new ApiError(404, 'Subsidy application not found');
  return doc;
}

export async function getSubsidy(id) {
  const doc = await SubsidyApplication.findById(id).populate('customer order installation');
  if (!doc) throw new ApiError(404, 'Subsidy application not found');
  return doc;
}
