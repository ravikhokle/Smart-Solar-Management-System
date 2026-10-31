import * as svc from '../services/order.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => {
  const data = await svc.listOrders(req.query);
  ok(res, data.items, 'Orders', data.meta);
});

export const get = asyncHandler(async (req, res) => {
  ok(res, await svc.getOrder(req.params.id));
});

export const syncPayment = asyncHandler(async (req, res) => {
  ok(res, await svc.syncRazorpayPayment(req.user, req.params.id), 'Payment status synchronized');
});

export const createFromQuote = asyncHandler(async (req, res) => {
  created(res, await svc.createOrderFromQuotation(req.user, req.body.quotationId), 'Order created');
});

export const update = asyncHandler(async (req, res) => {
  ok(res, await svc.updateOrder(req.user, req.params.id, req.body), 'Order updated');
});

export const remove = asyncHandler(async (req, res) => {
  await svc.deleteOrder(req.user, req.params.id);
  res.status(204).send();
});
