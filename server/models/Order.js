import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
    systemCapacityKw: { type: Number, required: true },
    systemType: { type: String, enum: ['on_grid', 'off_grid'] },
    orderDate: { type: Date, default: Date.now },
    orderAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue'],
      default: 'pending',
      index: true,
    },
    installationStatus: {
      type: String,
      enum: ['pending', 'scheduled', 'in_progress', 'completed', 'on_hold', 'cancelled'],
      default: 'pending',
    },
    inventoryStatus: {
      type: String,
      enum: ['unreserved', 'reserved', 'dispatched', 'partial'],
      default: 'unreserved',
    },
    assignedTeam: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Technician' }],
    expectedInstallationDate: Date,
    costSnapshot: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
