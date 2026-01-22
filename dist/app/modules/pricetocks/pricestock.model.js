"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceStockModel = void 0;
const mongoose_1 = require("mongoose");
const PriceStockSchema = new mongoose_1.Schema({
    _id: { type: String },
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
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'pricestock' // Explicitly setting collection name
});
// Create index for faster searching by SKU or Product ID
PriceStockSchema.index({ "Shop SKU": 1, "Product ID": 1 });
exports.PriceStockModel = (0, mongoose_1.model)('PriceStock', PriceStockSchema);
