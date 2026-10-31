import mongoose from 'mongoose';

const productCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export const ProductCategory = mongoose.model('ProductCategory', productCategorySchema);
