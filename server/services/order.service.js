import { Order } from '../models/Order.js';
import { Quotation } from '../models/Quotation.js';
import { Payment } from '../models/Payment.js';
import { ApiError } from '../utils/apiError.js';
import { nextNumber } from '../utils/sequence.js';
import { paginate } from '../utils/query.js';
import { writeAudit } from './audit.service.js';
import { notifyRole, notifyUsers } from './notification.service.js';
import { env } from '../config/env.js';
import { createPaymentLink } from './razorpay.service.js';
import { getPaymentLinkPayments } from './razorpay.service.js';

const populate = [
  { path: 'customer', select: 'fullName phone email address city state pinCode' },
  { path: 'quotation' },
  { path: 'assignedTeam' },
  { path: 'createdBy', select: 'name' },
];

export async function attachPaymentSummary(order) {
  const agg = await Payment.aggregate([
    { $match: { order: order._id } },
    { $group: { _id: null, received: { $sum: '$amount' } } },
  ]);
  const received = agg[0]?.received || 0;
  const outstanding = Math.max(0, Number((order.orderAmount - received).toFixed(2)));
  const obj = order.toObject ? order.toObject() : { ...order };
  obj.amountReceived = received;
  obj.outstandingBalance = outstanding;
  return obj;
}

export async function listOrders({ status, paymentStatus, page, limit, q }) {
  const { skip, limit: l, page: p } = paginate({ page, limit });
  const filter = {};
  if (status) filter.installationStatus = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (q) filter.orderNumber = new RegExp(q, 'i');
  const [items, total] = await Promise.all([
    Order.find(filter).populate(populate).sort({ createdAt: -1 }).skip(skip).limit(l),
    Order.countDocuments(filter),
  ]);
  const withPay = await Promise.all(items.map((o) => attachPaymentSummary(o)));
  return { items: withPay, meta: { page: p, limit: l, total } };
}

export async function getOrder(id) {
  const order = await Order.findById(id).populate(populate);
  if (!order) throw new ApiError(404, 'Order not found');
  const payments = await Payment.find({ order: order._id }).sort({ paymentDate: -1 });
  const summary = await attachPaymentSummary(order);
  summary.payments = payments;
  return summary;
}

export async function syncRazorpayPayment(actor, id) {
  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, 'Order not found');
  if (!order.razorpayPaymentLinkId) throw new ApiError(400, 'This order has no Razorpay payment link');
  const { link, payments } = await getPaymentLinkPayments(order.razorpayPaymentLinkId);
  const paid = payments.find((payment) => ['captured', 'authorized'].includes(payment.status));
  if (!paid) {
    throw new ApiError(400, `Razorpay has not marked this payment link as paid yet (status: ${link.status || 'unknown'})`);
  }
  const paymentId = paid.id || paid.payment_id;
  if (paid && paymentId && !(await Payment.exists({ transactionReference: paymentId }))) {
    await Payment.create({
      receiptNumber: await nextNumber('RCPT'),
      order: order._id,
      customer: order.customer,
      amount: Number(paid.amount) / 100,
      method: 'razorpay',
      transactionReference: paid.id || paid.payment_id,
      paymentDate: paid.created_at ? new Date(paid.created_at * 1000) : new Date(),
      notes: `Razorpay payment link ${order.razorpayPaymentLinkId}`,
      recordedBy: actor._id,
    });
    await refreshPaymentStatus(order._id);
    const savedPayment = await Payment.findOne({ transactionReference: paymentId });
    if (savedPayment) {
      const { emailPaymentReceipt } = await import('./payment.service.js');
      await emailPaymentReceipt(savedPayment._id);
    }
  }
  return getOrder(order._id);
}

export async function createOrderFromQuotation(actor, quotationId) {
  const quotation = await Quotation.findById(quotationId).populate('customer');
  if (!quotation) throw new ApiError(404, 'Quotation not found');
  const existing = await Order.findOne({ quotation: quotation._id });
  if (existing) return getOrder(existing._id);
  if (quotation.approvalStatus !== 'accepted') {
    throw new ApiError(400, 'Only accepted quotations can be converted into orders');
  }
  const costSnapshot = quotation.items.reduce(
    (sum, i) => sum + Number(i.quantity) * Number(i.unitCostSnapshot || 0),
    0
  );
  if (!quotation.customer?.email) {
    throw new ApiError(400, 'Customer email is required to create a Razorpay payment link');
  }
  const order = await Order.create({
    orderNumber: await nextNumber('ORD'),
    customer: quotation.customer._id,
    quotation: quotation._id,
    systemCapacityKw: quotation.systemCapacityKw,
    systemType: quotation.systemType,
    orderAmount: quotation.totalAmount,
    costSnapshot,
    createdBy: actor?._id,
  });
  let paymentLink;
  try {
    paymentLink = await createPaymentLink({ order, customer: quotation.customer });
  } catch (error) {
    await Order.findByIdAndDelete(order._id);
    throw error;
  }
  order.razorpayPaymentLinkId = paymentLink.id;
  order.razorpayPaymentLinkUrl = paymentLink.url;
  await order.save();
  quotation.approvalStatus = 'converted';
  quotation.history.push({ status: 'converted', note: 'Converted to order', by: actor?._id });
  await quotation.save();
  await notifyRole('warehouse_manager', {
    title: 'New order requires inventory',
    body: `Order ${order.orderNumber} is ready for stock reservation.`,
    link: `/orders/${order._id}`,
  });
  await writeAudit({ actor: actor?._id, action: 'order.create', entityType: 'Order', entityId: order._id });
  if (quotation.customer?.email) {
    await notifyUsers({
      userIds: [],
      title: 'Order confirmed',
      body: `Order ${order.orderNumber} has been created.`,
    });
    const { sendEmail } = await import('./email.service.js');
    await sendEmail({
      to: quotation.customer.email,
      subject: `Order ${order.orderNumber} confirmed`,
      title: 'Your solar order is confirmed',
      body: `Order ${order.orderNumber} for ${quotation.systemCapacityKw} kW has been created. Use the secure Razorpay test payment link to pay ₹${Number(order.orderAmount).toFixed(2)}.`,
      ctaUrl: paymentLink.url,
      ctaLabel: 'Pay securely',
    });
  }
  return getOrder(order._id);
}

export async function updateOrder(actor, id, payload) {
  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, 'Order not found');
  if (payload.expectedInstallationDate) order.expectedInstallationDate = payload.expectedInstallationDate;
  if (payload.assignedTeam) order.assignedTeam = payload.assignedTeam;
  if (payload.installationStatus) order.installationStatus = payload.installationStatus;
  await order.save();
  return getOrder(id);
}

export async function deleteOrder(actor, id) {
  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, 'Order not found');
  if (['completed', 'in_progress'].includes(order.installationStatus) || order.inventoryStatus === 'dispatched') {
    throw new ApiError(400, 'Cannot delete an order that is dispatched or in installation');
  }
  const { Payment } = await import('../models/Payment.js');
  const { Installation } = await import('../models/Installation.js');
  await Payment.deleteMany({ order: id });
  await Installation.deleteMany({ order: id });
  await Order.findByIdAndDelete(id);
  await writeAudit({ actor: actor._id, action: 'order.delete', entityType: 'Order', entityId: id });
}

export async function refreshPaymentStatus(orderId) {
  const order = await Order.findById(orderId);
  if (!order) return;
  const summary = await attachPaymentSummary(order);
  if (summary.amountReceived <= 0) order.paymentStatus = 'pending';
  else if (summary.outstandingBalance <= 0.009) order.paymentStatus = 'paid';
  else order.paymentStatus = 'partial';
  await order.save();
  return order;
}
