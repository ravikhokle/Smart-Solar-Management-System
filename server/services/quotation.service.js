import { Quotation } from '../models/Quotation.js';
import { SiteSurvey } from '../models/SiteSurvey.js';
import { Product } from '../models/Product.js';
import { SystemTemplate } from '../models/SystemTemplate.js';
import { Enquiry } from '../models/Enquiry.js';
import { ApiError } from '../utils/apiError.js';
import { nextNumber } from '../utils/sequence.js';
import { paginate } from '../utils/query.js';
import { getSettings } from '../models/Setting.js';
import { writeAudit } from './audit.service.js';
import { sendEmail } from './email.service.js';
import { env } from '../config/env.js';

const populate = [
  { path: 'customer' },
  { path: 'survey' },
  { path: 'items.product', select: 'name sku kind sellingPrice' },
  { path: 'createdBy', select: 'name email' },
];

export function computeTotals({ items, discountAmount = 0, taxPercent = 0 }) {
  const subtotal = items.reduce((sum, i) => sum + Number(i.quantity) * Number(i.unitPrice), 0);
  const discount = Math.min(Number(discountAmount) || 0, subtotal);
  const taxable = subtotal - discount;
  const taxAmount = Number(((taxable * (Number(taxPercent) || 0)) / 100).toFixed(2));
  const totalAmount = Number((taxable + taxAmount).toFixed(2));
  return { subtotal, discountAmount: discount, taxPercent, taxAmount, totalAmount };
}

async function hydrateItems(rawItems) {
  const items = [];
  for (const row of rawItems || []) {
    const product = row.product ? await Product.findById(row.product) : null;
    items.push({
      product: product?._id,
      name: row.name || product?.name,
      kind: row.kind || product?.kind || 'other',
      quantity: Number(row.quantity),
      unitPrice: Number(row.unitPrice ?? product?.sellingPrice ?? 0),
      unitCostSnapshot: Number(product?.unitCost ?? 0),
    });
  }
  return items;
}

export async function listQuotations({ status, page, limit, q }) {
  const { skip, limit: l, page: p } = paginate({ page, limit });
  const filter = {};
  if (status) filter.approvalStatus = status;
  if (q) filter.quotationNumber = new RegExp(q, 'i');
  const [items, total] = await Promise.all([
    Quotation.find(filter).populate(populate).sort({ createdAt: -1 }).skip(skip).limit(l),
    Quotation.countDocuments(filter),
  ]);
  return { items, meta: { page: p, limit: l, total } };
}

export async function getQuotation(id) {
  const doc = await Quotation.findById(id).populate(populate);
  if (!doc) throw new ApiError(404, 'Quotation not found');
  return doc;
}

export async function createQuotation(actor, payload) {
  const survey = await SiteSurvey.findById(payload.survey).populate('customer enquiry');
  if (!survey) throw new ApiError(404, 'Site survey not found');
  if (survey.approvalStatus !== 'approved') {
    throw new ApiError(400, 'Quotations can only be created from an approved site survey');
  }
  const settings = await getSettings();
  let items = payload.items;
  if (payload.templateId) {
    const template = await SystemTemplate.findById(payload.templateId);
    if (!template) throw new ApiError(404, 'System template not found');
    items = template.items.map((i) => ({ product: i.product, quantity: i.quantity }));
  }
  const hydrated = await hydrateItems(items);
  const totals = computeTotals({
    items: hydrated,
    discountAmount: payload.discountAmount,
    taxPercent: payload.taxPercent ?? settings.defaultTaxPercent,
  });
  const validUntil = payload.validUntil
    ? new Date(payload.validUntil)
    : new Date(Date.now() + settings.defaultQuotationValidityDays * 86400000);

  const quotation = await Quotation.create({
    quotationNumber: await nextNumber('QT'),
    customer: survey.customer._id || survey.customer,
    survey: survey._id,
    enquiry: survey.enquiry,
    systemCapacityKw: payload.systemCapacityKw || survey.proposedCapacityKw,
    systemType: payload.systemType || survey.systemType,
    items: hydrated,
    ...totals,
    termsAndConditions: payload.termsAndConditions || settings.defaultTerms,
    validUntil,
    createdBy: actor._id,
    history: [{ status: 'draft', note: 'Quotation created', by: actor._id }],
  });
  await writeAudit({
    actor: actor._id,
    action: 'quotation.create',
    entityType: 'Quotation',
    entityId: quotation._id,
  });
  return getQuotation(quotation._id);
}

export async function updateQuotation(actor, id, payload) {
  const quotation = await Quotation.findById(id);
  if (!quotation) throw new ApiError(404, 'Quotation not found');
  if (!['draft', 'sent'].includes(quotation.approvalStatus)) {
    throw new ApiError(400, 'Only draft or sent quotations can be edited');
  }
  if (payload.items) quotation.items = await hydrateItems(payload.items);
  if (payload.discountAmount !== undefined) quotation.discountAmount = payload.discountAmount;
  if (payload.taxPercent !== undefined) quotation.taxPercent = payload.taxPercent;
  if (payload.termsAndConditions !== undefined) quotation.termsAndConditions = payload.termsAndConditions;
  if (payload.validUntil) quotation.validUntil = payload.validUntil;
  if (payload.systemCapacityKw) quotation.systemCapacityKw = payload.systemCapacityKw;
  const totals = computeTotals(quotation);
  Object.assign(quotation, totals);
  quotation.version += 1;
  quotation.history.push({ status: quotation.approvalStatus, note: 'Quotation updated', by: actor._id });
  await quotation.save();
  return getQuotation(id);
}

export async function sendQuotation(actor, id) {
  const quotation = await getQuotation(id);
  quotation.approvalStatus = 'sent';
  quotation.history.push({ status: 'sent', note: 'Sent to customer', by: actor._id });
  await quotation.save();
  if (quotation.customer?.email) {
    await sendEmail({
      to: quotation.customer.email,
      subject: `Quotation ${quotation.quotationNumber}`,
      title: 'Your solar quotation is ready',
      body: `Quotation ${quotation.quotationNumber} totalling ₹${quotation.totalAmount} is ready for review.`,
      ctaLabel: 'View details',
      ctaUrl: `${env.clientUrl}/quotations/${quotation._id}`,
    });
  }
  return getQuotation(id);
}

export async function decideQuotation(actor, id, { accept, note }) {
  const quotation = await Quotation.findById(id);
  if (!quotation) throw new ApiError(404, 'Quotation not found');
  if (!['draft', 'sent'].includes(quotation.approvalStatus)) {
    throw new ApiError(400, 'This quotation can no longer be accepted or rejected');
  }
  quotation.approvalStatus = accept ? 'accepted' : 'rejected';
  quotation.history.push({
    status: quotation.approvalStatus,
    note: note || (accept ? 'Customer accepted' : 'Customer rejected'),
    by: actor._id,
  });
  await quotation.save();
  if (accept && quotation.enquiry) {
    await Enquiry.findByIdAndUpdate(quotation.enquiry, { status: 'converted' });
  }
  await writeAudit({
    actor: actor._id,
    action: accept ? 'quotation.accept' : 'quotation.reject',
    entityType: 'Quotation',
    entityId: quotation._id,
  });
  return getQuotation(id);
}

export async function listTemplates() {
  return SystemTemplate.find({ isActive: true }).populate('items.product').sort({ capacityKw: 1 });
}

export async function saveTemplate(actor, payload) {
  return SystemTemplate.create({ ...payload, createdBy: actor._id });
}

export async function deleteQuotation(actor, id) {
  const quotation = await Quotation.findById(id);
  if (!quotation) throw new ApiError(404, 'Quotation not found');
  if (quotation.approvalStatus === 'converted') {
    throw new ApiError(400, 'Cannot delete a quotation that has been converted to an order');
  }
  await Quotation.findByIdAndDelete(id);
  await writeAudit({ actor: actor._id, action: 'quotation.delete', entityType: 'Quotation', entityId: id });
}
