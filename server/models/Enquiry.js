import mongoose from 'mongoose';

export const ENQUIRY_STATUSES = [
  'new',
  'assigned',
  'in_progress',
  'survey_requested',
  'converted',
  'lost',
  'closed',
];

export const ENQUIRY_SOURCES = [
  'website',
  'referral',
  'walk_in',
  'phone',
  'campaign',
  'ai_voice_assistant',
  'other',
];

const enquirySchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    systemType: { type: String, enum: ['on_grid', 'off_grid'], required: true },
    expectedCapacityKw: { type: Number, required: true, min: 1, max: 5 },
    electricityConsumption: { type: String, default: '' },
    source: {
      type: String,
      enum: ENQUIRY_SOURCES,
      default: 'other',
    },
    enquiryDate: { type: Date, default: Date.now },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ENQUIRY_STATUSES, default: 'new', index: true },
    notes: { type: String, default: '' },
    conversationId: { type: String, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

enquirySchema.index({ enquiryDate: -1 });

export const Enquiry = mongoose.model('Enquiry', enquirySchema);
