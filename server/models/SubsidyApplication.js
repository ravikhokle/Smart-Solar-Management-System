import mongoose from 'mongoose';

const subsidySchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    installation: { type: mongoose.Schema.Types.ObjectId, ref: 'Installation' },
    eligible: { type: Boolean, default: false },
    applicationStatus: {
      type: String,
      enum: ['not_started', 'draft', 'submitted', 'under_review', 'approved', 'rejected'],
      default: 'not_started',
    },
    submittedDate: Date,
    documentsRequired: [{ type: String }],
    documentsSubmitted: [{ name: String, url: String }],
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    subsidyAmount: { type: Number, default: 0, min: 0 },
    remarks: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const SubsidyApplication = mongoose.model('SubsidyApplication', subsidySchema);
