import { Schema, model } from 'mongoose';
import { IPriceStockRaw } from './pricestock.interface';

const PriceStockSchema = new Schema<IPriceStockRaw>(
  {
    "Product ID": { type: Number, required: true },
    "catId": { type: Number, required: true },
    "*Product Name(English)": { type: String, required: true },
    "currencyCode": { type: String, default: 'BDT' },
    "sku": {
      "skuId": { type: Number }
    },
    "status": { 
      type: String, 
      enum: ['active', 'inactive'], 
      default: 'active' 
    },
    "Shop SKU": { type: String, required: true },
    "SellerSKU": { type: String },
    "*Quantity": { type: Number, required: true, min: 0 },
    "*Price": { type: Number, required: true, min: 0 },
    "Variations Combo": { type: String },
    "tr(s-wb-product@md5key)": { type: String }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'pricestock' // Explicitly setting collection name
  }
);

// Create index for faster searching by SKU or Product ID
PriceStockSchema.index({ "Shop SKU": 1, "Product ID": 1 });

export const PriceStockModel = model<IPriceStockRaw>('PriceStock', PriceStockSchema);