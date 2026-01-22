

export interface IPriceStock {


  _id?:string,
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
    _id?:string,
  "Product ID": number;
  "catId": number;
  "SpecialPrice":number,
  "SpecialPrice Start":string,
  "SpecialPrice End":string,
  "Product Name(Bengali) look function":string,
  "*Product Name(English)": string;
  "currencyCode": string;
  "sku": {
    "skuId": number;
  };
  "status": string;
  "Highlights":string,
  "Shop SKU": string;
  "SellerSKU": string;
  "*Quantity": number;
  "*Price": number;
  "Variations Combo": string;
  "tr(s-wb-product@md5key)": string;
}