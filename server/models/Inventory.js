import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Solar Panels', 'Inverters', 'Batteries', 'Mounting Systems', 'Electrical & Wiring', 'Meters'],
      required: true,
    },
    manufacturer: {
      type: String,
      required: true,
    },
    modelNumber: {
      type: String,
      default: '',
    },
    quantityInStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    allocatedQuantity: {
      type: Number,
      default: 0,
    },
    minThreshold: {
      type: Number,
      default: 10,
    },
    unitCost: {
      type: Number,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    warrantyYears: {
      type: Number,
      default: 10,
    },
    warehouseLocation: {
      type: String,
      default: 'Warehouse Alpha - Bay 4',
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.virtual('isLowStock').get(function () {
  return this.quantityInStock <= this.minThreshold;
});

export default mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
