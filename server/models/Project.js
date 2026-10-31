import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'blocked'],
    default: 'pending',
  },
  completedAt: { type: Date },
});

const projectSchema = new mongoose.Schema(
  {
    projectCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    systemCapacityKw: {
      type: Number,
      required: [true, 'System capacity in kW is required'],
      min: 1,
    },
    panelCount: {
      type: Number,
      default: 0,
    },
    panelModel: {
      type: String,
      default: 'Tier-1 420W Monocrystalline PERC',
    },
    inverterModel: {
      type: String,
      default: 'SolarEdge Energy Hub 7.6kW',
    },
    batteryStorageKwh: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        'Lead',
        'Site Audit',
        'Engineering Design',
        'Permitting',
        'Installation',
        'Commissioning',
        'Completed',
        'Cancelled',
      ],
      default: 'Site Audit',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    contractValue: {
      type: Number,
      default: 0,
    },
    targetCompletionDate: {
      type: Date,
    },
    installationAddress: {
      type: String,
      required: true,
    },
    assignedManager: {
      type: String,
      default: 'Sarah Jenkins',
    },
    leadEngineer: {
      type: String,
      default: 'Alex Rivera',
    },
    milestones: [milestoneSchema],
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
