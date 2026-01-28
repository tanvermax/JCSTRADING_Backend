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
    const { page: queryPage, limit: queryLimit, search, category } = query, filterData = __rest(query, ["page", "limit", "search", "category"]);
    const page = Number(queryPage) || 1;
    const limit = Number(queryLimit) || 20;
    const skip = (page - 1) * limit;
    const searchCondition = search
        ? { "*Product Name(English)": { $regex: search, $options: "i" } }
        : {};
    // --- CATEGORY FILTER LOGIC ---
    // Note: Since category is calculated in $project, 
    // we use the same regex logic in $match to filter before pagination.
    let categoryCondition = {};
    if (category === "PC") {
        categoryCondition = { "*Product Name(English)": { $regex: /computer|wheel/i } };
    }
    else if (category === "Pet Supplies") {
        categoryCondition = { "*Product Name(English)": { $regex: /cat|kitten/i } };
    }
    // Add other categories here...
    const product = yield pricestock_model_1.PriceStockModel.aggregate([
        {
            $match: Object.assign(Object.assign(Object.assign({}, filterData), searchCondition), categoryCondition // Apply the filter here
            )
        },
        { $skip: skip },
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
                // --- NEW CATEGORIZATION LOGIC ---
                "category": {
                    $switch: {
                        branches: [
                            {
                                case: { $regexMatch: { input: "$*Product Name(English)", regex: /cat|kitten|feline/i } },
                                then: "Pet Supplies"
                            },
                            {
                                case: { $regexMatch: { input: "$*Product Name(English)", regex: /car|auto|bmw|vehicle|wheel/i } },
                                then: "Automotive"
                            },
                            {
                                case: {
                                    $and: [
                                        { $not: { $regexMatch: { input: "$*Product Name(English)", regex: /steering|car/i } } }, // Must NOT match
                                        // { $regexMatch: { input: "$*Product Name(English)", regex: /computer|mouse|wheel/i } } // Must match
                                    ]
                                },
                                then: "other"
                            },
                            {
                                case: {
                                    //  $regexMatch: { input: "$*Product Name(English)", regex: /guitar|acoustic|strum|strings/i }
                                    $and: [
                                        { $regexMatch: { input: "$*Product Name(English)", regex: /guitar|acoustic|strum|strings/i } },
                                        { $not: { $regexMatch: { input: "$*Product Name(English)", regex: /Keyring|Keychain|car/i } } }
                                    ]
                                },
                                then: "Musical Instruments"
                            }
                        ],
                        default: "Uncategorized"
                    }
                },
                // --- END OF NEW LOGIC ---
                "*Price": 1,
                "SpecialPrice Start": 1,
                "SpecialPrice End": 1,
                "*Quantity": 1,
                "Shop SKU": 1,
                "currenczyCode": 1,
                "SpecialPrice": 1,
                "images": "$basicInfo.*Product Images1",
                "description": "$basicInfo.Main Description"
                // ... add other fields as needed
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
