import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    company: {
      type: String,
      default: '',
    },
    customerType: {
      type: String,
      enum: ['Residential', 'Commercial', 'Industrial'],
      default: 'Residential',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'USA' },
    },
    roofType: {
      type: String,
      enum: ['Composite Shingle', 'Tile', 'Metal Standing Seam', 'Flat TPO/EPDM', 'Ground Mount'],
      default: 'Composite Shingle',
    },
    avgMonthlyPowerBill: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Customer || mongoose.model('Customer', customerSchema);
