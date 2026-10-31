import { Installation } from '../models/Installation.js';
import { Order } from '../models/Order.js';
import { Technician } from '../models/Technician.js';
import { SerialNumber } from '../models/SerialNumber.js';
import { ApiError } from '../utils/apiError.js';
import { paginate } from '../utils/query.js';
import { writeAudit } from './audit.service.js';
import { uploadMany } from './upload.service.js';
import { activateWarrantiesForOrder } from './warranty.service.js';
import { sendEmail } from './email.service.js';
import { Customer } from '../models/Customer.js';
import { env } from '../config/env.js';

const populate = [
  { path: 'order', select: 'orderNumber orderAmount systemCapacityKw installationStatus' },
  { path: 'customer', select: 'fullName phone email address city' },
  { path: 'technicians' },
];

export async function listInstallations({ status, from, to, page, limit }) {
  const { skip, limit: l, page: p } = paginate({ page, limit });
  const filter = {};
  if (status) filter.status = status;
  if (from || to) {
    filter.scheduledDate = {};
    if (from) filter.scheduledDate.$gte = new Date(from);
    if (to) filter.scheduledDate.$lte = new Date(to);
  }
  const [items, total] = await Promise.all([
    Installation.find(filter).populate(populate).sort({ scheduledDate: 1 }).skip(skip).limit(l),
    Installation.countDocuments(filter),
  ]);
  return { items, meta: { page: p, limit: l, total } };
}

export async function getInstallation(id) {
  const doc = await Installation.findById(id).populate(populate);
  if (!doc) throw new ApiError(404, 'Installation not found');
  return doc;
}

export async function scheduleInstallation(actor, payload) {
  const order = await Order.findById(payload.order);
  if (!order) throw new ApiError(404, 'Order not found');
  const existing = await Installation.findOne({ order: order._id });
  if (existing) throw new ApiError(409, 'Installation already scheduled for this order');
  const technicians = await Technician.find({ _id: { $in: payload.technicians || [] } });
  const installation = await Installation.create({
    order: order._id,
    customer: order.customer,
    technicians: technicians.map((t) => t._id),
    scheduledDate: payload.scheduledDate,
    notes: payload.notes,
    status: technicians.length ? 'assigned' : 'scheduled',
    createdBy: actor._id,
  });
  order.installationStatus = 'scheduled';
  order.assignedTeam = technicians.map((t) => t._id);
  order.expectedInstallationDate = payload.scheduledDate;
  await order.save();
  await Technician.updateMany({ _id: { $in: technicians.map((t) => t._id) } }, { availability: 'on_job' });
  const customer = await Customer.findById(order.customer);
  if (customer?.email) {
    await sendEmail({
      to: customer.email,
      subject: 'Installation scheduled',
      title: 'Your solar installation is scheduled',
      body: `Installation for order ${order.orderNumber} is scheduled on ${new Date(payload.scheduledDate).toLocaleString()}.`,
      ctaUrl: `${env.clientUrl}/installations/${installation._id}`,
      ctaLabel: 'View schedule',
    });
  }
  await writeAudit({
    actor: actor._id,
    action: 'installation.schedule',
    entityType: 'Installation',
    entityId: installation._id,
  });
  return getInstallation(installation._id);
}

export async function updateInstallation(actor, id, payload, files) {
  const installation = await Installation.findById(id);
  if (!installation) throw new ApiError(404, 'Installation not found');
  if (typeof payload.customerConfirmation === 'string') {
    try {
      payload.customerConfirmation = JSON.parse(payload.customerConfirmation);
    } catch {
      payload.customerConfirmation = undefined;
    }
  }
  const allowed = [
    'scheduledDate',
    'startTime',
    'completionTime',
    'actualCapacityKw',
    'notes',
    'testingNotes',
    'commissioningNotes',
    'status',
    'technicians',
    'labourHours',
  ];
  for (const key of allowed) {
    if (payload[key] !== undefined) installation[key] = payload[key];
  }
  if (files?.length) {
    const kind = payload.photoKind || 'other';
    const uploaded = await uploadMany(files, 'heliosflow/installations');
    installation.photographs.push(...uploaded.map((u) => ({ url: u.url, publicId: u.publicId, kind })));
  }
  if (payload.customerConfirmation) {
    installation.customerConfirmation = {
      confirmed: true,
      name: payload.customerConfirmation.name,
      signatureDataUrl: payload.customerConfirmation.signatureDataUrl,
      confirmedAt: new Date(),
    };
  }
  if (payload.status === 'in_progress' && !installation.startTime) installation.startTime = new Date();
  if (payload.status === 'completed') {
    if (!installation.customerConfirmation?.confirmed) {
      throw new ApiError(400, 'Customer confirmation is required before completing installation');
    }
    installation.completionTime = installation.completionTime || new Date();
    await Order.findByIdAndUpdate(installation.order, { installationStatus: 'completed' });
    await SerialNumber.updateMany(
      { order: installation.order, status: 'dispatched' },
      { status: 'installed', installedAt: new Date() }
    );
    await activateWarrantiesForOrder(installation.order, actor);
    await Technician.updateMany({ _id: { $in: installation.technicians } }, { availability: 'available' });
  } else if (payload.status === 'in_progress') {
    await Order.findByIdAndUpdate(installation.order, { installationStatus: 'in_progress' });
  } else if (payload.status === 'on_hold' || payload.status === 'cancelled') {
    await Order.findByIdAndUpdate(installation.order, {
      installationStatus: payload.status === 'cancelled' ? 'cancelled' : 'on_hold',
    });
  }
  await installation.save();
  return getInstallation(id);
}
