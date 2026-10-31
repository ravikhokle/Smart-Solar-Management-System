import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    status: String,
    note: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const siteSurveySchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    enquiry: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', required: true },
    surveyor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    roofAreaSqft: { type: Number, min: 0 },
    roofDirection: { type: String, trim: true },
    roofTilt: { type: String, trim: true },
    cableDistanceM: { type: Number, min: 0 },
    roofCondition: { type: String, default: '' },
    availableSpaceSqft: { type: Number, min: 0 },
    proposedCapacityKw: { type: Number, min: 1, max: 5 },
    systemType: { type: String, enum: ['on_grid', 'off_grid'] },
    photographs: [{ url: String, publicId: String, caption: String }],
    technicalObservations: { type: String, default: '' },
    surveyDate: { type: Date, default: Date.now },
    approvalStatus: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected'],
      default: 'draft',
      index: true,
    },
    rejectionReason: { type: String, default: '' },
    history: [historySchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const SiteSurvey = mongoose.model('SiteSurvey', siteSurveySchema);
