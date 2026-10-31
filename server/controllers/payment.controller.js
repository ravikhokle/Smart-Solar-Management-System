import * as svc from '../services/payment.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created } from '../utils/response.js';
import { streamPdf, drawKeyValues, money } from '../services/pdf.service.js';

export const list = asyncHandler(async (req, res) => {
  const data = await svc.listPayments(req.query);
  ok(res, data.items, 'Payments', data.meta);
});

export const create = asyncHandler(async (req, res) => {
  created(res, await svc.recordPayment(req.user, req.body), 'Payment recorded');
});

export const get = asyncHandler(async (req, res) => {
  ok(res, await svc.getPayment(req.params.id));
});

export const remove = asyncHandler(async (req, res) => {
  await svc.deletePayment(req.user, req.params.id);
  res.status(204).send();
});

export const receiptPdf = asyncHandler(async (req, res) => {
  const { payment, order } = await svc.getPayment(req.params.id);
  await streamPdf(res, `${payment.receiptNumber}.pdf`, (doc) => {
    doc.moveDown(3);
    doc.fontSize(18).text(`Receipt ${payment.receiptNumber}`);
    doc.moveDown();
    drawKeyValues(doc, [
      ['Order', order.orderNumber],
      ['Customer', payment.customer?.fullName],
      ['Amount', money(payment.amount)],
      ['Method', payment.method],
      ['Reference', payment.transactionReference],
      ['Date', new Date(payment.paymentDate).toLocaleString()],
      ['Outstanding after this receipt', money(order.outstandingBalance)],
    ]);
  });
});
