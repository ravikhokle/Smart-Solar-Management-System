import { ServiceTicket } from '../models/ServiceTicket.js';
import { Warranty } from '../models/Warranty.js';
import { SerialNumber } from '../models/SerialNumber.js';
import { Customer } from '../models/Customer.js';
import { ApiError } from '../utils/apiError.js';
import { nextNumber } from '../utils/sequence.js';
import { paginate } from '../utils/query.js';
import { isCovered, expireOverdue } from './warranty.service.js';
import { writeAudit } from './audit.service.js';
import { sendEmail } from './email.service.js';
import { env } from '../config/env.js';

const populate = [
  { path: 'customer', select: 'fullName phone email' },
  { path: 'product', select: 'name sku kind' },
  { path: 'warranty' },
  { path: 'assignedTechnician' },
  { path: 'serialNumber' },
];

function billTotals(ticket) {
  const partsTotal = (ticket.repairParts || []).reduce(
    (s, p) => s + Number(p.quantity || 0) * Number(p.unitPrice || 0),
    0
  );
  ticket.partsTotal = partsTotal;
  if (ticket.warrantyStatus === 'covered') {
    ticket.billableTotal = 0;
    ticket.labourCharges = 0;
  } else {
    ticket.billableTotal = partsTotal + Number(ticket.labourCharges || 0);
  }
}

export async function listTickets({ status, page, limit, q }) {
  const { skip, limit: l, page: p } = paginate({ page, limit });
  const filter = {};
  if (status) filter.status = status;
  if (q) filter.ticketNumber = new RegExp(q, 'i');
  const [items, total] = await Promise.all([
    ServiceTicket.find(filter).populate(populate).sort({ createdAt: -1 }).skip(skip).limit(l),
    ServiceTicket.countDocuments(filter),
  ]);
  return { items, meta: { page: p, limit: l, total } };
}

export async function getTicket(id) {
  const doc = await ServiceTicket.findById(id).populate(populate);
  if (!doc) throw new ApiError(404, 'Service ticket not found');
  return doc;
}

export async function createTicket(actor, payload) {
  await expireOverdue();
  let serialDoc = null;
  let warranty = null;
  if (payload.serial) {
    serialDoc = await SerialNumber.findOne({ serial: payload.serial.trim() }).populate('product customer');
    if (!serialDoc) throw new ApiError(404, 'Serial number not found');
    warranty = await Warranty.findOne({ serial: serialDoc.serial });
  }
  const customerId = payload.customer || serialDoc?.customer?._id || serialDoc?.customer;
  if (!customerId) throw new ApiError(400, 'Customer is required');
  await Customer.findById(customerId);
  const covered = isCovered(warranty);
  const ticket = await ServiceTicket.create({
    ticketNumber: await nextNumber('TKT'),
    customer: customerId,
    product: payload.product || serialDoc?.product?._id || serialDoc?.product,
    serialNumber: serialDoc?._id,
    serial: serialDoc?.serial || payload.serial,
    warranty: warranty?._id,
    description: payload.description,
    priority: payload.priority || 'medium',
    warrantyStatus: covered ? 'covered' : warranty ? 'not_covered' : 'pending',
    createdBy: actor._id,
    history: [{ status: 'open', note: 'Ticket opened', by: actor._id }],
  });
  const customer = await Customer.findById(customerId);
  if (customer?.email) {
    await sendEmail({
      to: customer.email,
      subject: `Service ticket ${ticket.ticketNumber}`,
      title: 'Service request received',
      body: `We opened ticket ${ticket.ticketNumber}. Warranty status: ${ticket.warrantyStatus.replace('_', ' ')}.`,
    });
  }
  await writeAudit({ actor: actor._id, action: 'ticket.create', entityType: 'ServiceTicket', entityId: ticket._id });
  return getTicket(ticket._id);
}

export async function updateTicket(actor, id, payload) {
  const ticket = await ServiceTicket.findById(id);
  if (!ticket) throw new ApiError(404, 'Service ticket not found');
  if (payload.assignedTechnician) {
    ticket.assignedTechnician = payload.assignedTechnician;
    if (ticket.status === 'open') ticket.status = 'assigned';
  }
  if (payload.status) ticket.status = payload.status;
  if (payload.repairParts) ticket.repairParts = payload.repairParts;
  if (payload.labourCharges !== undefined) ticket.labourCharges = payload.labourCharges;
  if (payload.resolutionNotes !== undefined) ticket.resolutionNotes = payload.resolutionNotes;
  if (payload.priority) ticket.priority = payload.priority;
  if (payload.customerConfirmation) {
    ticket.customerConfirmation = {
      confirmed: true,
      name: payload.customerConfirmation.name,
      confirmedAt: new Date(),
    };
  }
  if (payload.status === 'closed') {
    if (!ticket.customerConfirmation?.confirmed) {
      throw new ApiError(400, 'Customer confirmation is required before closing the ticket');
    }
  }
  billTotals(ticket);
  ticket.history.push({
    status: ticket.status,
    note: payload.note || 'Ticket updated',
    by: actor._id,
  });
  await ticket.save();
  return getTicket(id);
}
