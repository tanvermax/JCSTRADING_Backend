import { Schema, model } from 'mongoose';
import { IPriceStockRaw } from './pricestock.interface';

const PriceStockSchema = new Schema<IPriceStockRaw>(
  {
    "Product ID": { type: Number, required: true },
    "catId": { type: Number }, // Removed required if not always available from front-end
    "*Product Name(English)": { type: String, required: true },
    "Product Name(Bengali) look function": { type: String },
    "currencyCode": { type: String, default: 'BDT' },
    "SpecialPrice": { type: Number },
    "SpecialPrice Start": { type: String },
    "SpecialPrice End": { type: String },
    "status": {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    "Shop SKU": { type: String, required: true },
    "SellerSKU": { type: String },
    "*Quantity": { type: Number, required: true, min: 0 },
    "*Price": { type: Number, required: true, min: 0 },
    "description": { type: String },
    "Highlights": { type: String },
    "images": { type: String }, // Primary Image URL
    "White Background Image": { type: String },
    "images2": { type: String },
    "images3": { type: String },
    "images4": { type: String },
    "images5": { type: String },
    "image6": { type: String },
    "sku": {
      "skuId": { type: Number }
    },
    "tr(s-wb-product@md5key)": { type: String }
  },
  {
    timestamps: true,
    collection: 'pricestock'
  }
);

PriceStockSchema.index({ "Shop SKU": 1, "Product ID": 1 });

export const PriceStockModel = model<IPriceStockRaw>('PriceStock', PriceStockSchema);