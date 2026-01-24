
import { Types } from "mongoose";
import { PriceStockModel } from "./pricestock.model";






const getAllPStock = async (query: Record<string, string>) => {
   // 1. Get page and limit from query, or use defaults
  const { page: queryPage, limit: queryLimit, search, ...filterData } = query;

    const page = Number(queryPage) || 1;
    const limit = Number(queryLimit) || 20; 
    const skip = (page - 1) * limit; // এটিই নির্ধারণ করে কোন ২০টি ডাটা আসবে

    // ২. সার্চ কন্ডিশন তৈরি করুন
    const searchCondition = search 
        ? { "*Product Name(English)": { $regex: search, $options: "i" } } 
        : {};

    const product = await PriceStockModel.aggregate([
        {
            // ৩. এখানে শুধু ফিল্টার এবং সার্চ থাকবে (page/limit থাকবে না)
            $match: { ...filterData, ...searchCondition }
        },
        { $skip: skip },   // আগের ডাটাগুলো বাদ দিবে
        { $limit: limit }, // পরবর্তী ২০টি ডাটা নিবে
        {
            $lookup: {
                from: "besic",
                localField: "Product ID",
                foreignField: "Product ID",
                as: "basicInfo"
            }
        },
        {
            $unwind: {
                path: "$basicInfo",
                preserveNullAndEmptyArrays: true
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

    const totalProduct = await PriceStockModel.countDocuments({ ...filterData, ...searchCondition });

    return {
        data: product,
        meta: {
            total: totalProduct,
            page,
            limit
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