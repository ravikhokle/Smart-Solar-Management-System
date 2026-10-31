import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, unique: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    amount: { type: Number, required: true, min: 0.01 },
    method: {
      type: String,
      enum: ['cash', 'upi', 'neft', 'rtgs', 'cheque', 'card', 'other'],
      default: 'upi',
    },
    transactionReference: { type: String, default: '' },
    paymentDate: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
