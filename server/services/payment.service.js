import { Payment } from '../models/Payment.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/apiError.js';
import { nextNumber } from '../utils/sequence.js';
import { paginate } from '../utils/query.js';
import { refreshPaymentStatus, getOrder } from './order.service.js';
import { writeAudit } from './audit.service.js';
import { sendEmail } from './email.service.js';
import { env } from '../config/env.js';
import { createPdfBuffer, drawKeyValues, money } from './pdf.service.js';

export async function listPayments({ order, page, limit }) {
  const { skip, limit: l, page: p } = paginate({ page, limit });
  const filter = {};
  if (order) filter.order = order;
  const [items, total] = await Promise.all([
    Payment.find(filter)
      .populate('customer', 'fullName phone')
      .populate('order', 'orderNumber orderAmount')
      .populate('recordedBy', 'name')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(l),
    Payment.countDocuments(filter),
  ]);
  return { items, meta: { page: p, limit: l, total } };
}

export async function recordPayment(actor, payload) {
  const order = await Order.findById(payload.order).populate('customer');
  if (!order) throw new ApiError(404, 'Order not found');
  const existing = await Payment.aggregate([
    { $match: { order: order._id } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const received = existing[0]?.total || 0;
  const outstanding = order.orderAmount - received;
  if (payload.amount > outstanding + 0.01) {
    throw new ApiError(400, `Amount exceeds outstanding balance of ₹${outstanding.toFixed(2)}`);
  }
  const payment = await Payment.create({
    receiptNumber: await nextNumber('RCPT'),
    order: order._id,
    customer: order.customer._id,
    amount: payload.amount,
    method: payload.method,
    transactionReference: payload.transactionReference,
    paymentDate: payload.paymentDate || new Date(),
    notes: payload.notes,
    recordedBy: actor._id,
  });
  await refreshPaymentStatus(order._id);
  await writeAudit({ actor: actor._id, action: 'payment.record', entityType: 'Payment', entityId: payment._id });
  await emailPaymentReceipt(payment._id);
  return Payment.findById(payment._id).populate('customer order recordedBy');
}

export async function emailPaymentReceipt(paymentId) {
  const { payment, order } = await getPayment(paymentId);
  if (!payment.customer?.email) return;
  const pdf = await createPdfBuffer((doc) => {
    doc.moveDown(3);
    doc.fontSize(18).text(`Receipt ${payment.receiptNumber}`);
    doc.moveDown();
    drawKeyValues(doc, [
      ['Order', order.orderNumber],
      ['Customer', payment.customer.fullName],
      ['Amount', money(payment.amount)],
      ['Method', payment.method],
      ['Reference', payment.transactionReference],
      ['Date', new Date(payment.paymentDate).toLocaleString()],
      ['Outstanding after this receipt', money(order.outstandingBalance)],
    ]);
  });
  await sendEmail({
    to: payment.customer.email,
    subject: `Payment receipt ${payment.receiptNumber}`,
    title: 'Payment received',
    body: `We received ₹${Number(payment.amount).toFixed(2)} towards order ${order.orderNumber}. Your receipt is attached as a PDF.`,
    attachments: [{ filename: `${payment.receiptNumber}.pdf`, content: pdf, contentType: 'application/pdf' }],
  });
}

export async function getPayment(id) {
  const payment = await Payment.findById(id).populate('customer order recordedBy');
  if (!payment) throw new ApiError(404, 'Payment not found');
  const order = await getOrder(payment.order._id || payment.order);
  return { payment, order };
}

export async function deletePayment(actor, id) {
  const payment = await Payment.findById(id);
  if (!payment) throw new ApiError(404, 'Payment not found');
  const orderId = payment.order;
  await Payment.findByIdAndDelete(id);
  await refreshPaymentStatus(orderId);
  await writeAudit({ actor: actor._id, action: 'payment.delete', entityType: 'Payment', entityId: id });
}
