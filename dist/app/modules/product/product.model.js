"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const ProductSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number },
    stock: { type: Number, min: 0 },
    category: { type: String },
    slug: { type: String, unique: true },
    newproduct: { type: Boolean, default: true },
    images: { type: String },
    brand: { type: String },
    sku: { type: String, unique: true, sparse: true },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true, // adds createdAt & updatedAt automatically
});
exports.Product = (0, mongoose_1.model)("Product", ProductSchema);
