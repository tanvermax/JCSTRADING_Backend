import { PriceStockModel } from "./pricestock.model";






const getAllPStock = async (query: Record<string, string>) => {
    const filter = query
    // console.log("filter",filter)
    const product = await PriceStockModel.find(filter);
    // console.log(product)
    const totalProduct = await PriceStockModel.countDocuments();

    return {
        data: product,
        meta: {
            total: totalProduct
        }
    }
}



export const pstockService = {
    getAllPStock
}