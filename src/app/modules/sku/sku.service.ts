import { Skuming } from "./sku.model";



const getAllSku = async (query: Record<string, string>) => {
    const filter = query
    console.log("getAllSku", filter)
    const mapped = await Skuming.find({});
 
    const totalProduct = await Skuming.countDocuments();

    return {
        data: mapped,
        meta: {
            total: totalProduct
        }
    }
}



export const SkuService = {
    getAllSku
}