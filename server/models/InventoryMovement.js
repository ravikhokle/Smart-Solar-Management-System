import mongoose from 'mongoose';

const inventoryMovementSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    type: {
      type: String,
      enum: ['received', 'reserved', 'unreserved', 'dispatched', 'returned', 'adjustment'],
      required: true,
    },
    quantity: { type: Number, required: true },
    referenceType: { type: String, default: '' },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    notes: { type: String, default: '' },
    serialNumbers: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const InventoryMovement = mongoose.model('InventoryMovement', inventoryMovementSchema);
