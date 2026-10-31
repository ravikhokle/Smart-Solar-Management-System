import mongoose from 'mongoose';

const technicianSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    skills: [{ type: String, trim: true }],
    availability: {
      type: String,
      enum: ['available', 'on_job', 'leave', 'unavailable'],
      default: 'available',
    },
    employmentStatus: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export const Technician = mongoose.model('Technician', technicianSchema);
