"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlldataModel = void 0;
const mongoose_1 = require("mongoose");
const VariantSchema = new mongoose_1.Schema({
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
}, { _id: false });
const AlldataSchema = new mongoose_1.Schema({
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
    specs: { type: mongoose_1.Schema.Types.Mixed, default: {} },
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
}, {
    timestamps: true,
    collection: 'alldata',
    _id: false, // we're supplying our own string _id above
});
// Alldata.model.ts ফাইলের নিচের দিকের ইনডেক্সগুলো এভাবে গুছিয়ে লিখুন:
// ১. টেক্সট সার্চের জন্য শুধুমাত্র ১টি কম্বাইন্ড টেক্সট ইনডেক্স (ডুপ্লিকেটগুলো ডিলিট করুন)
AlldataSchema.index({ name: 'text', category: 'text' });
// ২. মোস্ট পাওয়ারফুল কম্পাউন্ড ইনডেক্স (যা আপনার getAllProducts কোয়েরিকে কাভার করবে)
// এটি ক্যাটাগরি, স্ট্যাটাস, প্রাইস এবং ক্রিয়েট টাইম একসাথে ট্র্যাক রাখবে
AlldataSchema.index({ status: 1, category: 1, minPrice: 1, createdAt: -1 });
AlldataSchema.index({ inStock: 1, status: 1 });
// ৩. অ্যাডমিন প্যানেল বা নরমাল সর্টিং এর জন্য
AlldataSchema.index({ createdAt: -1 });
exports.AlldataModel = (0, mongoose_1.model)('Alldata', AlldataSchema);
