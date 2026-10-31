import mongoose from 'mongoose';

const surveySchema = new mongoose.Schema(
  {
    surveyCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    auditorName: {
      type: String,
      required: true,
    },
    auditDate: {
      type: Date,
      default: Date.now,
    },
    roofCondition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Requires Repair / Replacement'],
      default: 'Good',
    },
    roofTiltDegrees: {
      type: Number,
      default: 20,
    },
    azimuthOrientation: {
      type: String,
      enum: ['South (180°)', 'South-West (225°)', 'West (270°)', 'East (90°)', 'North-East (45°)'],
      default: 'South (180°)',
    },
    shadingPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 5,
    },
    electricalServiceAmps: {
      type: Number,
      enum: [100, 125, 150, 200, 400],
      default: 200,
    },
    mainPanelUpgradeRequired: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Action Required'],
      default: 'Scheduled',
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

export default mongoose.models.Survey || mongoose.model('Survey', surveySchema);
