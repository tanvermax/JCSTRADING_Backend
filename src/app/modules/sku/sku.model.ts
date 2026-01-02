import  { model, Schema } from "mongoose";
import { ISku, ISkuProduct } from "./sku.interface";

const skuSchema = new Schema<ISku>(
  {
    skuId: {type: Number,required: true,
    },
    auditStatus: {
        type: Number,required: true,
    },
    skuStatus: {
      type: Number,required: true,
    },
  },
  { _id: false }
);

const skuproductSchema = new Schema<ISkuProduct>(
  {
    productId: {
      type: Number,required: true,
    },

    categoryId: {
      type: Number,required: true,
    },

    productName: {
      type: String,required: true,trim: true,
    },

    sku: {
      type: skuSchema,required: true,
    },

    shopSku: {
      type: String,required: true,
    },

    image: {
      type: String,required: true,
    },

    sellerSku: {
      type: String,required: true,
    },

    variation: {
      type: String,required: true,
    },

    md5Key: {
      type: String,required: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

export const Skuming = model<ISkuProduct>("Skuming", skuproductSchema);
