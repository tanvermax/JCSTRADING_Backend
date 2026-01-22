
import { Types } from "mongoose";
import { PriceStockModel } from "./pricestock.model";






const getAllPStock = async (query: Record<string, string>) => {
    // const page = Number(query.page) || 1;
    // const limit = Number(query.limit) || 20;
    // const skip = (page - 1) * limit;
    // We use aggregate instead of find to join collections
    const product = await PriceStockModel.aggregate([
        // { $skip: skip },
        // { $limit: limit },
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
                "Product Name(Bengali) look function": "$basicInfo.Product Name(Bengali) look function",
                "*Price": 1,
                "SpecialPrice Start": 1,
                "SpecialPrice End": 1,
                "*Quantity": 1,
                "Shop SKU": 1,
                "currenczyCode": 1,
                "SpecialPrice": 1,
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
    console.log("numericProductId", id)

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
                 "Product Name(Bengali) look function": "$details.Product Name(Bengali) look function",
                "*Price": 1,
                "*Quantity": 1,
                "Shop SKU": 1,
                "currenczyCode": 1,
                "SpecialPrice": 1,
                "SpecialPrice Start": 1,
                "SpecialPrice End": 1,
                // "Highlights":"$details.Highlights",
                "Highlights": "$details.Highlights",
                "images": "$details.*Product Images1",
                "description": "$details.Main Description",
                // You can also bring other images if you want a gallery
                "images2": "$details.Product Images2",
                "images3": "$details.Product Images3",
                "images4": "$details.Product Images4",
                "images5": "$details.Product Images5",
                "image6": "$details.Product Images6",
                "image7": "$details.Product Images7",
                "image8": "$details.Product Images8",
                "image9": "$details.Product Images9",
                "White Background Image":"$details.White Background Image"
            }
        }
    ]);

    // console.log("result", result)

    // Aggregate returns an array, so we return the first item
    return result;
};
export const pstockService = {
    getAllPStock, getSinglePStock
}