import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true },
    companyName: { type: String, default: 'HeliosFlow Solar' },
    companyAddress: { type: String, default: '' },
    companyPhone: { type: String, default: '' },
    companyEmail: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    minAdvancePercentBeforeDispatch: { type: Number, default: 50, min: 0, max: 100 },
    defaultTaxPercent: { type: Number, default: 18, min: 0 },
    defaultQuotationValidityDays: { type: Number, default: 15 },
    defaultTerms: {
      type: String,
      default:
        'Quotation is valid for the stated period. Prices are inclusive of listed taxes unless specified. Advance payment is required before material dispatch as per company policy.',
    },
    labourHourlyRate: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const Setting = mongoose.model('Setting', settingSchema);

export async function getSettings() {
  let doc = await Setting.findOne({ key: 'default' });
  if (!doc) doc = await Setting.create({ key: 'default' });
  return doc;
}
