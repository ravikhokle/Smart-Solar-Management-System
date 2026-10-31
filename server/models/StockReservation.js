import mongoose from 'mongoose';

const stockReservationSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['active', 'dispatched', 'released'], default: 'active' },
  },
  { timestamps: true }
);

export const StockReservation = mongoose.model('StockReservation', stockReservationSchema);
