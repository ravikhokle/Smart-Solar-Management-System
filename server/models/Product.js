import mongoose from 'mongoose';

export const PRODUCT_KINDS = [
  'solar_panel',
  'inverter',
  'battery',
  'mounting',
  'dc_cable',
  'ac_cable',
  'switch',
  'protection',
  'connector',
  'earthing',
  'other',
];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' },
    kind: { type: String, enum: PRODUCT_KINDS, default: 'other' },
    brand: { type: String, default: '' },
    model: { type: String, default: '' },
    description: { type: String, default: '' },
    unitCost: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    quantityOnHand: { type: Number, default: 0, min: 0 },
    quantityReserved: { type: Number, default: 0, min: 0 },
    minStockLevel: { type: Number, default: 0, min: 0 },
    warrantyDurationMonths: { type: Number, default: 12, min: 0 },
    warrantyActivationMilestone: {
      type: String,
      enum: ['dispatch', 'installation'],
      default: 'installation',
    },
    requiresSerialNumber: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual('availableQuantity').get(function availableQuantity() {
  return Math.max(0, (this.quantityOnHand || 0) - (this.quantityReserved || 0));
});

export const Product = mongoose.model('Product', productSchema);
