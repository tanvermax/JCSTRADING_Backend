
export interface IProduct {
    _id?: string; // unique product ID (UUID or DB ObjectId)
    title: string;
    description: string;
    price?: number;
    stock?: number;
    category: string;
    slug: string,
    newproduct:boolean,
    images?: string;
    brand?: string; // optional
    sku?: string;   // stock keeping unit
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean; // to mark product availability
}
