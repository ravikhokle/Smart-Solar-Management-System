import * as svc from '../services/customer.service.js';
import { Enquiry } from '../models/Enquiry.js';
import { Order } from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => {
  const data = await svc.listCustomers(req.query);
  ok(res, data.items, 'Customers', data.meta);
});

export const create = asyncHandler(async (req, res) => {
  const customer = await svc.createCustomer(req.user, req.body, { force: req.body.force });
  created(res, customer, 'Customer created');
});

export const get = asyncHandler(async (req, res) => {
  const customer = await svc.getCustomer(req.params.id);
  const [enquiries, orders] = await Promise.all([
    Enquiry.find({ customer: customer._id }).sort({ createdAt: -1 }),
    Order.find({ customer: customer._id }).sort({ createdAt: -1 }),
  ]);
  ok(res, { customer, enquiries, orders });
});

export const update = asyncHandler(async (req, res) => {
  const customer = await svc.updateCustomer(req.user, req.params.id, req.body);
  ok(res, customer, 'Customer updated');
});

export const duplicates = asyncHandler(async (req, res) => {
  const items = await svc.findDuplicates(req.query);
  ok(res, items);
});
