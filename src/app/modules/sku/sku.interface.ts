export interface ISku {
  skuId: number;
  auditStatus: number;
  skuStatus: number;
}

export interface ISkuProduct {
  _id?: string;

  productId: number;
  categoryId: number;
  productName: string;

  sku: ISku;

  shopSku: string;
  image: string;
  sellerSku: string;
  variation: string;
  md5Key: string;

  createdAt?: Date;
  updatedAt?: Date;
}
