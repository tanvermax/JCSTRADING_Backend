"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductZodSchema = void 0;
const zod_1 = require("zod");
exports.CreateProductZodSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "Title must be at least 3 characters long"),
    description: zod_1.z.string().min(4, "Description must be at least 4 characters long"),
    price: zod_1.z.number().optional(),
    stock: zod_1.z.number().optional(),
    category: zod_1.z.string().min(2, "Category is required").optional(),
    slug: zod_1.z.string().regex(/^[a-z0-9-]+$/, "Slug must be URL-friendly").optional(),
    newproduct: zod_1.z.boolean().optional(),
    images: zod_1.z.array(zod_1.z.string().url("Must be a valid URL")).min(1, "At least one image is required").optional(),
    brand: zod_1.z.string().optional(),
    sku: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    createdAt: zod_1.z.date().default(() => new Date()),
    updatedAt: zod_1.z.date().default(() => new Date()),
    isActive: zod_1.z.boolean().default(true),
});
// ✅ Inferred Type
