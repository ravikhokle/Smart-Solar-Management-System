import * as svc from '../services/razorpay.service.js';
import { Payment } from '../models/Payment.js';
import { Order } from '../models/Order.js';
import { nextNumber } from '../utils/sequence.js';
import { refreshPaymentStatus } from '../services/order.service.js';

export async function webhook(req, res) {
  if (!svc.verifyWebhookSignature(req.body, req.get('x-razorpay-signature'))) {
    return res.status(401).json({ success: false, message: 'Invalid Razorpay signature' });
  }
  const event = JSON.parse(req.body.toString('utf8'));
  if (event.event === 'payment_link.paid') {
    const link = event.payload.payment_link.entity;
    const paymentEntity = event.payload.payment.entity;
    const order = await Order.findOne({ razorpayPaymentLinkId: link.id });
    if (order && !(await Payment.exists({ transactionReference: paymentEntity.id }))) {
      await Payment.create({
        receiptNumber: await nextNumber('RCPT'),
        order: order._id,
        customer: order.customer,
        amount: Number(paymentEntity.amount) / 100,
        method: 'razorpay',
        transactionReference: paymentEntity.id,
        paymentDate: new Date(),
        notes: `Razorpay payment link ${link.id}`,
      });
      await refreshPaymentStatus(order._id);
      const savedPayment = await Payment.findOne({ transactionReference: paymentEntity.id });
      if (savedPayment) {
        const { emailPaymentReceipt } = await import('../services/payment.service.js');
        await emailPaymentReceipt(savedPayment._id);
      }
    }
  }
  return res.json({ success: true });
}
