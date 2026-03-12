// Interface representing the RAW data (Database/Excel/API structure)
export interface IPriceStockRaw {
  _id?: string;
  "Product ID": number;
  "catId": number;
  "description"?: string;
  "*Product Name(English)": string;
  "Product Name(Bengali) look function"?: string;
  "currencyCode": string;
  "SpecialPrice"?: number;
  "SpecialPrice Start"?: string;
  "SpecialPrice End"?: string;
  "sku": {
    "skuId": number;
  };
  "status": 'active' | 'inactive';
  "Highlights"?: string;
  "Shop SKU": string;
  "SellerSKU"?: string;
  "*Quantity": number;
  "*Price": number;
  "Variations Combo"?: string;
  "tr(s-wb-product@md5key)"?: string;
  
  // Image Fields (To match your request)
  "images"?: string;
  "White Background Image"?: string;
  "images2"?: string;
  "images3"?: string;
  "images4"?: string;
  "images5"?: string;
  "image6"?: string;
}

// Clean interface for internal application use (CamelCase)
export interface IPriceStock {
  id?: string;
  productId: number;
  catId: number;
  productNameEnglish: string;
  productNameBengali?: string;
  description?: string;
  currencyCode: string;
  skuId: number;
  status: 'active' | 'inactive';
  shopSku: string;
  sellerSku?: string;
  quantity: number;
  price: number;
  specialPrice?: number;
  highlights?: string;
  mainImage?: string;
  md5Key?: string;
}