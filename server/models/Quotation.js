import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    kind: String,
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    unitCostSnapshot: { type: Number, default: 0 },
  },
  { _id: false }
);

const historySchema = new mongoose.Schema(
  {
    status: String,
    note: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: { type: String, unique: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    survey: { type: mongoose.Schema.Types.ObjectId, ref: 'SiteSurvey', required: true },
    enquiry: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry' },
    systemCapacityKw: { type: Number, required: true, min: 1, max: 5 },
    systemType: { type: String, enum: ['on_grid', 'off_grid'], required: true },
    items: [itemSchema],
    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    termsAndConditions: { type: String, default: '' },
    validUntil: { type: Date },
    version: { type: Number, default: 1 },
    parentQuotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
    approvalStatus: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'],
      default: 'draft',
      index: true,
    },
    history: [historySchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Quotation = mongoose.model('Quotation', quotationSchema);
