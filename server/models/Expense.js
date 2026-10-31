import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['installation', 'labour', 'logistics', 'procurement', 'office', 'other'],
      default: 'other',
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    expenseDate: { type: Date, default: Date.now, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    installation: { type: mongoose.Schema.Types.ObjectId, ref: 'Installation' },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Expense = mongoose.model('Expense', expenseSchema);
