import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Customer full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pinCode: {
      type: String,
      required: [true, 'PIN code is required'],
      trim: true,
    },
    customerType: {
      type: String,
      enum: ['residential', 'commercial', 'industrial'],
      default: 'residential',
    },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

customerSchema.index({ fullName: 'text', phone: 'text', email: 'text' });

export const Customer = mongoose.model('Customer', customerSchema);
