export interface IAlldataVariant {
  skuId: string;
  shopSku?: string;
  sellerSku?: string;
  status: 'active' | 'inactive';
  combo?: string;
  quantity: number;
  price: number;
  specialPrice?: number;
  specialPriceStart?: string;
  specialPriceEnd?: string;
  image?: string;
  images?: string[];
  weightKg?: number;
  dims?: {
    l?: number;
    w?: number;
    h?: number;
  };
  dangerousGoods?: string;
}

export interface IAlldata {
  _id: string; // Daraz Product ID used directly as Mongo _id
  catId?: string;
  category?: string;
  name: string;
  nameBn?: string;
  mainImage?: string;
  images?: string[];
  whiteBackgroundImage?: string;
  warranty?: string;
  warrantyType?: string;
  description?: string;
  highlights?: string;
  specs?: Record<string, string>;
  variants: IAlldataVariant[];

  // precomputed / denormalized fields — set at write time, never computed at read time
  minPrice?: number;
  maxPrice?: number;
  specialPrice?: number;
  hasDiscount: boolean;
  totalStock: number;
  inStock: boolean;
  status: 'active' | 'inactive';
  variantCount: number;

  slug?: string;
  createdAt?: Date;
  updatedAt?: Date;
}