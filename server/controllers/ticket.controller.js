import * as svc from '../services/ticket.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => {
  const data = await svc.listTickets(req.query);
  ok(res, data.items, 'Tickets', data.meta);
});

export const get = asyncHandler(async (req, res) => {
  ok(res, await svc.getTicket(req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  created(res, await svc.createTicket(req.user, req.body), 'Ticket created');
});

export const update = asyncHandler(async (req, res) => {
  ok(res, await svc.updateTicket(req.user, req.params.id, req.body), 'Ticket updated');
});
