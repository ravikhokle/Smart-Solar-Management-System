import mongoose from 'mongoose';

export const INSTALLATION_STATUSES = [
  'scheduled',
  'assigned',
  'in_progress',
  'completed',
  'on_hold',
  'cancelled',
];

const installationSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    technicians: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Technician' }],
    scheduledDate: { type: Date, required: true, index: true },
    startTime: Date,
    completionTime: Date,
    actualCapacityKw: Number,
    notes: { type: String, default: '' },
    photographs: [{ url: String, publicId: String, kind: { type: String, enum: ['before', 'after', 'other'] } }],
    testingNotes: { type: String, default: '' },
    commissioningNotes: { type: String, default: '' },
    customerConfirmation: {
      confirmed: { type: Boolean, default: false },
      name: String,
      signatureDataUrl: String,
      confirmedAt: Date,
    },
    status: { type: String, enum: INSTALLATION_STATUSES, default: 'scheduled', index: true },
    labourHours: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Installation = mongoose.model('Installation', installationSchema);
