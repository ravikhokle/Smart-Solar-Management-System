import mongoose from 'mongoose';

export const TICKET_STATUSES = [
  'open',
  'assigned',
  'in_progress',
  'waiting_for_parts',
  'resolved',
  'closed',
];

const historySchema = new mongoose.Schema(
  {
    status: String,
    note: String,
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const partSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const serviceTicketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, unique: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    serialNumber: { type: mongoose.Schema.Types.ObjectId, ref: 'SerialNumber' },
    serial: String,
    warranty: { type: mongoose.Schema.Types.ObjectId, ref: 'Warranty' },
    description: { type: String, required: true },
    complaintDate: { type: Date, default: Date.now },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician' },
    warrantyStatus: { type: String, enum: ['covered', 'not_covered', 'pending'], default: 'pending' },
    repairParts: [partSchema],
    labourCharges: { type: Number, default: 0, min: 0 },
    partsTotal: { type: Number, default: 0 },
    billableTotal: { type: Number, default: 0 },
    resolutionNotes: { type: String, default: '' },
    status: { type: String, enum: TICKET_STATUSES, default: 'open', index: true },
    customerConfirmation: {
      confirmed: { type: Boolean, default: false },
      name: String,
      confirmedAt: Date,
    },
    history: [historySchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const ServiceTicket = mongoose.model('ServiceTicket', serviceTicketSchema);
