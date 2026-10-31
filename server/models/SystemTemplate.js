import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const systemTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    systemType: { type: String, enum: ['on_grid', 'off_grid'], required: true },
    capacityKw: { type: Number, required: true, min: 1, max: 5 },
    description: { type: String, default: '' },
    items: [itemSchema],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const SystemTemplate = mongoose.model('SystemTemplate', systemTemplateSchema);
