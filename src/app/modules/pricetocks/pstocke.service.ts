
import { Types } from "mongoose";
import { PriceStockModel } from "./pricestock.model";






const getAllPStock = async (query: Record<string, string>) => {
    // We use aggregate instead of find to join collections
    const product = await PriceStockModel.aggregate([
        {
            // 1. Filter based on your query (like category or status)
            $match: query
        },
        {
            // 2. Look into the 'basics' collection (use the actual collection name in DB)
            $lookup: {
                from: "besic", // Check your MongoDB for the exact collection name
                localField: "Product ID",
                foreignField: "Product ID",
                as: "basicInfo"
            }
        },
        {
            // 3. Convert basicInfo array to a single object
            $unwind: {
                path: "$basicInfo",
                preserveNullAndEmptyArrays: true // Keep product even if image is missing
            }
        },
        {
            // 4. Clean up the output to match what your Frontend needs
            $project: {
                _id: 1,
                "Product ID": 1,
                "*Product Name(English)": 1,
                "*Price": 1,
                "*Quantity": 1,
                "Shop SKU": 1,
                // Bring the image from basic collection to the top level
                "images": "$basicInfo.*Product Images1",
                "description": "$basicInfo.Main Description"
            }
        }
    ]);

    const totalProduct = await PriceStockModel.countDocuments(query);

    return {
        data: product,
        meta: {
            total: totalProduct
        }
    };
};

const getSinglePStock = async (id: string) => {
    console.log("numericProductId",id)

    const cleanId = id.startsWith(':') ? id.substring(1) : id;

    const result = await PriceStockModel.aggregate([
        {
            // 1. Match the specific product by its MongoDB _id
          $match: { _id: new Types.ObjectId(cleanId) }
        },
        {
            // 2. Join with the "besic" collection
            $lookup: {
                from: "besic",
                localField: "Product ID",
                foreignField: "Product ID",
                as: "details"
            }
        },
        {
            // 3. Flatten the joined array
            $unwind: {
                path: "$details",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            // 4. Project the fields exactly how your Frontend expects them
            $project: {
                _id: 1,
                "Product ID": 1,
                "*Product Name(English)": 1,
                "*Price": 1,
                "*Quantity": 1,
                "Shop SKU": 1,
                "images": "$details.*Product Images1",
                "description": "$details.Main Description",
                // You can also bring other images if you want a gallery
                "images2": "$details.Product Images2",
                "images3": "$details.Product Images3"
            }
        }
    ]);

    console.log("result", result)

    // Aggregate returns an array, so we return the first item
    return result;
};
export const pstockService = {
    getAllPStock, getSinglePStock
}