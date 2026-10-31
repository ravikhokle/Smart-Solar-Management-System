import mongoose from 'mongoose';

const serialNumberSchema = new mongoose.Schema(
  {
    serial: { type: String, required: true, unique: true, trim: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qrPayload: { type: String, default: '' },
    qrImageDataUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['in_stock', 'reserved', 'dispatched', 'installed', 'returned'],
      default: 'in_stock',
      index: true,
    },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    receivedAt: { type: Date, default: Date.now },
    dispatchedAt: Date,
    installedAt: Date,
  },
  { timestamps: true }
);

export const SerialNumber = mongoose.model('SerialNumber', serialNumberSchema);
