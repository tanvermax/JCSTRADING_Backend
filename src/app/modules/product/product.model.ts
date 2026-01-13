import { model, Schema } from "mongoose";
import { IProduct } from "./product.interface";

const ProductSchema = new Schema<IProduct>(
    {
        // _id: { type: String, required: true, trim: true },
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
    },
    {
        timestamps: true, // adds createdAt & updatedAt automatically
    }
);



export const Product = model<IProduct>("Product", ProductSchema)
