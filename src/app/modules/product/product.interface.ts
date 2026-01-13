import { Types } from "mongoose";

export interface IProduct {
    _id?: Types.ObjectId | string; 
    title: string;
    description: string;
    price?: number;
    stock?: number;
    category: string;
    slug: string,
    newproduct:boolean,
    images?: string;
    brand?: string; 
    sku?: string;  
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean; 
}
