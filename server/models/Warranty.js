import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    status: String,
    note: String,
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const warrantySchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    serialNumber: { type: mongoose.Schema.Types.ObjectId, ref: 'SerialNumber' },
    serial: { type: String, index: true },
    durationMonths: { type: Number, required: true },
    activationMilestone: { type: String, enum: ['dispatch', 'installation'] },
    startDate: Date,
    expiryDate: { type: Date, index: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'void'],
      default: 'pending',
      index: true,
    },
    certificateNumber: { type: String, unique: true, sparse: true },
    history: [historySchema],
  },
  { timestamps: true }
);

export const Warranty = mongoose.model('Warranty', warrantySchema);
