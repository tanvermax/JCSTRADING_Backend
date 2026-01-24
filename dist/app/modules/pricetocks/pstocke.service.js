"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pstockService = void 0;
const mongoose_1 = require("mongoose");
const pricestock_model_1 = require("./pricestock.model");
const getAllPStock = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Get page and limit from query, or use defaults
    const { page: queryPage, limit: queryLimit, search } = query, filterData = __rest(query, ["page", "limit", "search"]);
    const page = Number(queryPage) || 1;
    const limit = Number(queryLimit) || 20;
    const skip = (page - 1) * limit; // এটিই নির্ধারণ করে কোন ২০টি ডাটা আসবে
    // ২. সার্চ কন্ডিশন তৈরি করুন
    const searchCondition = search
        ? { "*Product Name(English)": { $regex: search, $options: "i" } }
        : {};
    const product = yield pricestock_model_1.PriceStockModel.aggregate([
        {
            // ৩. এখানে শুধু ফিল্টার এবং সার্চ থাকবে (page/limit থাকবে না)
            $match: Object.assign(Object.assign({}, filterData), searchCondition)
        },
        { $skip: skip }, // আগের ডাটাগুলো বাদ দিবে
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
    const totalProduct = yield pricestock_model_1.PriceStockModel.countDocuments(Object.assign(Object.assign({}, filterData), searchCondition));
    return {
        data: product,
        meta: {
            total: totalProduct,
            page,
            limit
        }
    };
});
const getSinglePStock = (id) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("numericProductId", id);
    const cleanId = id.startsWith(':') ? id.substring(1) : id;
    const result = yield pricestock_model_1.PriceStockModel.aggregate([
        {
            // 1. Match the specific product by its MongoDB _id
            $match: { _id: new mongoose_1.Types.ObjectId(cleanId) }
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
                "White Background Image": "$details.White Background Image"
            }
        }
    ]);
    // console.log("result", result)
    // Aggregate returns an array, so we return the first item
    return result;
});
exports.pstockService = {
    getAllPStock, getSinglePStock
};
