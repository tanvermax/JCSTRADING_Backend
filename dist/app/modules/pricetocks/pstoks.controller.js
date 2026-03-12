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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PstokesController = void 0;
const pricestock_model_1 = require("./pricestock.model");
const catchAsync_1 = require("../../utils/catchAsync");
const sendresponse_1 = require("../../utils/sendresponse");
const pstocke_service_1 = require("./pstocke.service");
const AppError_1 = __importDefault(require("../../errorHelper/AppError"));
const cloudinary_config_1 = require("../../config/cloudinary.config");
// import AppError from "../../errorHelper/AppError";
const getAllPstokes = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    // console.log("query from controller", query)
    const result = yield pstocke_service_1.pstockService.getAllPStock(query);
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 201,
        message: "all Price Stokes data   successfully",
        success: true,
        data: result.data,
        meta: result.meta
    });
}));
const getSinglePStock = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    console.log("id", id);
    const productfound = yield pricestock_model_1.PriceStockModel.findById(id);
    console.log("productfound", productfound);
    const result = yield pstocke_service_1.pstockService.getSinglePStock(id);
    // if (!result) {
    //     throw new AppError(httpStatus.NOT_FOUND, "Product not found");
    // }
    console.log();
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 200,
        message: "Product details fetched successfully",
        success: true,
        data: result
    });
}));
const creatPricestok = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let parsedData;
    try {
        parsedData = typeof req.body.data === 'string'
            ? JSON.parse(req.body.data)
            : req.body;
    }
    catch (error) {
        throw new AppError_1.default(400, "Invalid JSON data format");
    }
    console.log("parsedData", parsedData);
    // 2. Check for the image
    if (!((_a = req.file) === null || _a === void 0 ? void 0 : _a.path)) {
        throw new AppError_1.default(400, "Image upload failed");
    }
    const finalPayload = Object.assign(Object.assign({}, parsedData), { images: req.file.path // Setting the primary image URL from Cloudinary/Multer
     });
    // 4. Call the service (Removed 'new' keyword)
    const product = yield pstocke_service_1.pstockService.createPricestock(finalPayload);
    console.log("product", product);
    if (!product) {
        // Clean up Cloudinary file if DB operation failed
        yield (0, cloudinary_config_1.deleteImageForCloudinary)(req.file.path);
        throw new AppError_1.default(500, "Failed to create product in database");
    }
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 201,
        message: "product created successfully",
        success: true,
        data: product,
    });
}));
exports.PstokesController = {
    getAllPstokes, getSinglePStock, creatPricestok
};
