"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Skuming = void 0;
const mongoose_1 = require("mongoose");
const skuSchema = new mongoose_1.Schema({
    skuId: { type: Number, required: true,
    },
    auditStatus: {
        type: Number, required: true,
    },
    skuStatus: {
        type: Number, required: true,
    },
}, { _id: false });
const skuproductSchema = new mongoose_1.Schema({
    productId: {
        type: Number, required: true,
    },
    categoryId: {
        type: Number, required: true,
    },
    productName: {
        type: String, required: true, trim: true,
    },
    sku: {
        type: skuSchema, required: true,
    },
    shopSku: {
        type: String, required: true,
    },
    image: {
        type: String, required: true,
    },
    sellerSku: {
        type: String, required: true,
    },
    variation: {
        type: String, required: true,
    },
    md5Key: {
        type: String, required: true,
    },
}, {
    timestamps: true, // adds createdAt & updatedAt
});
exports.Skuming = (0, mongoose_1.model)("Skuming", skuproductSchema);
