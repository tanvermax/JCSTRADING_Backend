import { Schema, model } from 'mongoose';
import { IAlldata, IAlldataVariant } from './alldata.interface';

const VariantSchema = new Schema<IAlldataVariant>(
  {
    skuId: { type: String, required: true },
    shopSku: { type: String },
    sellerSku: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    combo: { type: String },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    price: { type: Number, required: true, min: 0 },
    specialPrice: { type: Number },
    specialPriceStart: { type: String },
    specialPriceEnd: { type: String },
    image: { type: String },
    images: [{ type: String }],
    weightKg: { type: Number },
    dims: {
      l: { type: Number },
      w: { type: Number },
      h: { type: Number },
    },
    dangerousGoods: { type: String },
  },
  { _id: false }
);

const AlldataSchema = new Schema<IAlldata>(
  {
    _id: { type: String, required: true }, // Daraz Product ID as string
    catId: { type: String, index: true },
    category: { type: String, index: true },
    name: { type: String, required: true },
    nameBn: { type: String },
    mainImage: { type: String },
    images: [{ type: String }],
    whiteBackgroundImage: { type: String },
    warranty: { type: String },
    warrantyType: { type: String },
    description: { type: String },
    highlights: { type: String },
    specs: { type: Schema.Types.Mixed, default: {} },
    variants: { type: [VariantSchema], default: [] },

    minPrice: { type: Number, index: true },
    maxPrice: { type: Number },
    specialPrice: { type: Number },
    hasDiscount: { type: Boolean, default: false },
    totalStock: { type: Number, default: 0 },
    inStock: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    variantCount: { type: Number, default: 0 },

    slug: { type: String, unique: true, sparse: true },
  },
  {
    timestamps: true,
    collection: 'alldata',
    _id: false, // we're supplying our own string _id above
  }
);

// Compound indexes for the queries the frontend actually runs
AlldataSchema.index({ category: 1, status: 1, minPrice: 1 });
AlldataSchema.index({ name: 'text' });

export const AlldataModel = model<IAlldata>('Alldata', AlldataSchema);