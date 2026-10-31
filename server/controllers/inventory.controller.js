import * as svc from '../services/inventory.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => {
  const data = await svc.listProducts(req.query);
  ok(res, data.items, 'Products', data.meta);
});

export const get = asyncHandler(async (req, res) => {
  ok(res, await svc.getProduct(req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  created(res, await svc.createProduct(req.user, req.body), 'Product created');
});

export const update = asyncHandler(async (req, res) => {
  ok(res, await svc.updateProduct(req.user, req.params.id, req.body), 'Product updated');
});

export const categories = asyncHandler(async (req, res) => {
  ok(res, await svc.listCategories());
});

export const createCategory = asyncHandler(async (req, res) => {
  created(res, await svc.createCategory(req.body), 'Category created');
});

export const receive = asyncHandler(async (req, res) => {
  ok(res, await svc.receiveStock(req.user, req.body), 'Stock received');
});

export const reserve = asyncHandler(async (req, res) => {
  ok(res, await svc.reserveOrder(req.user, req.params.orderId), 'Stock reserved');
});

export const dispatch = asyncHandler(async (req, res) => {
  ok(res, await svc.dispatchOrder(req.user, req.params.orderId, req.body.serialAssignments || []), 'Dispatched');
});

export const serials = asyncHandler(async (req, res) => {
  const data = await svc.listSerials(req.query);
  ok(res, data.items, 'Serial numbers', data.meta);
});

export const lookup = asyncHandler(async (req, res) => {
  ok(res, await svc.lookupSerial(req.params.serial));
});

export const movements = asyncHandler(async (req, res) => {
  const data = await svc.listMovements(req.query);
  ok(res, data.items, 'Movements', data.meta);
});

export const low = asyncHandler(async (req, res) => {
  ok(res, await svc.lowStock());
});
