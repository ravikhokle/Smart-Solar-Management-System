import { Warranty } from '../models/Warranty.js';
import { Customer } from '../models/Customer.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { SerialNumber } from '../models/SerialNumber.js';
import { Installation } from '../models/Installation.js';
import { ApiError } from '../utils/apiError.js';
import { paginate, escapeRegex } from '../utils/query.js';
import { nextNumber } from '../utils/sequence.js';
import { sendEmail } from './email.service.js';
import { createPdfBuffer, drawKeyValues } from './pdf.service.js';

const populate = [
  { path: 'customer', select: 'fullName phone email' },
  { path: 'order', select: 'orderNumber' },
  { path: 'product', select: 'name sku kind warrantyDurationMonths' },
  { path: 'serialNumber', select: 'serial status' },
];

export async function listWarranties({ status, q, page, limit }) {
  await syncCompletedOrderWarranties();
  const { skip, limit: l, page: p } = paginate({ page, limit });
  const filter = {};
  if (status) filter.status = status;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    const customers = await Customer.find({ $or: [{ fullName: rx }, { phone: rx }, { email: rx }] }).select('_id');
    filter.$or = [
      { serial: rx },
      { certificateNumber: rx },
      { customer: { $in: customers.map((c) => c._id) } },
    ];
  }

  await expireOverdue();
  const [items, total] = await Promise.all([
    Warranty.find(filter).populate(populate).sort({ createdAt: -1 }).skip(skip).limit(l),
    Warranty.countDocuments(filter),
  ]);
  return { items, meta: { page: p, limit: l, total } };
}

async function syncCompletedOrderWarranties() {
  const [completedInstallations, completedOrders] = await Promise.all([
    Installation.find({ status: 'completed' }).select('order'),
    Order.find({ installationStatus: 'completed' }).select('_id'),
  ]);
  const orderIds = new Set([
    ...completedInstallations.map((installation) => String(installation.order)),
    ...completedOrders.map((order) => String(order._id)),
  ]);
  for (const orderId of orderIds) {
    await Order.findByIdAndUpdate(orderId, { installationStatus: 'completed' });
    await activateWarrantiesForOrder(orderId);
  }
}

export async function getWarranty(id) {
  await expireOverdue();
  const doc = await Warranty.findById(id).populate(populate);
  if (!doc) throw new ApiError(404, 'Warranty not found');
  return doc;
}

export async function expireOverdue() {
  await Warranty.updateMany(
    { status: 'active', expiryDate: { $lt: new Date() } },
    { $set: { status: 'expired' }, $push: { history: { status: 'expired', note: 'Expired automatically' } } }
  );
}

export async function activateWarrantiesForOrder(orderId, actor) {
  await createMissingWarrantiesForOrder(orderId, actor);
  const pending = await Warranty.find({ order: orderId, status: 'pending' });
  for (const w of pending) {
    w.startDate = new Date();
    w.expiryDate = new Date(w.startDate.getTime() + w.durationMonths * 30 * 86400000);
    w.status = 'active';
    if (!w.certificateNumber) w.certificateNumber = await nextNumber('WR');
    w.history.push({ status: 'active', note: 'Activated on installation completion', by: actor?._id });
    await w.save();
    const active = await getWarranty(w._id);
    if (active.customer?.email) {
      const pdf = await createPdfBuffer((doc) => {
        doc.moveDown(3);
        doc.fontSize(18).text('Warranty certificate');
        doc.moveDown();
        drawKeyValues(doc, [
          ['Certificate', active.certificateNumber],
          ['Customer', active.customer.fullName],
          ['Product', active.product?.name],
          ['Serial', active.serial || '—'],
          ['Duration (months)', active.durationMonths],
          ['Start', new Date(active.startDate).toLocaleDateString()],
          ['Expiry', new Date(active.expiryDate).toLocaleDateString()],
          ['Status', active.status],
        ]);
      });
      await sendEmail({
        to: active.customer.email,
        subject: `Warranty certificate ${active.certificateNumber}`,
        title: 'Your warranty certificate',
        body: 'Your solar equipment warranty has been activated. The warranty certificate is attached as a PDF.',
        attachments: [{ filename: `${active.certificateNumber}.pdf`, content: pdf, contentType: 'application/pdf' }],
      });
    }
  }
}

async function createMissingWarrantiesForOrder(orderId, actor) {
  const order = await Order.findById(orderId).populate('quotation');
  if (!order) return;

  const serials = await SerialNumber.find({ order: order._id });
  for (const serial of serials) {
    const product = await Product.findById(serial.product);
    if (!product || await Warranty.exists({ order: order._id, serialNumber: serial._id })) continue;
    await Warranty.create({
      customer: order.customer,
      order: order._id,
      product: product._id,
      serialNumber: serial._id,
      serial: serial.serial,
      durationMonths: product.warrantyDurationMonths,
      activationMilestone: product.warrantyActivationMilestone,
      status: 'pending',
      history: [{ status: 'pending', note: 'Created on installation completion', by: actor?._id }],
    });
  }

  if (!order.quotation?.items?.length) return;

  for (const item of order.quotation.items) {
    if (!item.product || item.quantity <= 0) continue;
    const product = await Product.findById(item.product);
    if (!product) continue;

    if (product.requiresSerialNumber) continue;

    const exists = await Warranty.exists({
      order: order._id,
      product: product._id,
      serialNumber: { $exists: false },
    });
    if (!exists) {
      await Warranty.create({
        customer: order.customer,
        order: order._id,
        product: product._id,
        durationMonths: product.warrantyDurationMonths,
        activationMilestone: product.warrantyActivationMilestone,
        status: 'pending',
        history: [{ status: 'pending', note: 'Created on installation completion', by: actor?._id }],
      });
    }
  }
}

export function isCovered(warranty) {
  if (!warranty) return false;
  if (warranty.status !== 'active') return false;
  if (!warranty.expiryDate) return false;
  return new Date(warranty.expiryDate) >= new Date();
}
