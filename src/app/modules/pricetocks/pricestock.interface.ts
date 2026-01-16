

export interface IPriceStock {
  productId: number;
  catId: number;
  productNameEnglish: string; // Cleaned name for internal use
  currencyCode: string;
  sku: {
    skuId: number;
  };
  status: 'active' | 'inactive';
  shopSku: string;
  sellerSku: string;
  quantity: number;
  price: number;
  variationCombo: string;
  md5Key?: string;
}

// Interface representing the raw data with special characters
export interface IPriceStockRaw {
  "Product ID": number;
  "catId": number;
  "*Product Name(English)": string;
  "currencyCode": string;
  "sku": {
    "skuId": number;
  };
  "status": string;
  "Shop SKU": string;
  "SellerSKU": string;
  "*Quantity": number;
  "*Price": number;
  "Variations Combo": string;
  "tr(s-wb-product@md5key)": string;
}