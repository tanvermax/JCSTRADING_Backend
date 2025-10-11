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
exports.ProductController = void 0;
const product_service_1 = require("./product.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendresponse_1 = require("../../utils/sendresponse");
const AppError_1 = __importDefault(require("../../errorHelper/AppError"));
const cloudinary_config_1 = require("../../config/cloudinary.config");
const creatProduct = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    console.log(req.body);
    if (!((_a = req.file) === null || _a === void 0 ? void 0 : _a.path)) {
        throw new AppError_1.default(400, "Image upload failed");
    }
    const payload = Object.assign(Object.assign({}, req.body), { images: ((_b = req.file) === null || _b === void 0 ? void 0 : _b.path) || null });
    const product = yield product_service_1.productService.createProduct(payload);
    console.log("product", product);
    if (!product) {
        // Clean up Cloudinary file if DB operation failed
        yield (0, cloudinary_config_1.deleteImageForCloudinary)((_c = req.file) === null || _c === void 0 ? void 0 : _c.path);
    }
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 201,
        message: "product created successfully",
        success: true,
        data: product,
    });
}));
const getAllProduct = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    console.log("query from controller", query);
    const result = yield product_service_1.productService.getAllProduct(query);
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 201,
        message: "all product retrive  successfully",
        success: true,
        data: result.data,
        meta: result.meta
    });
}));
const updateProduct = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = req.params.id;
    const payload = Object.assign(Object.assign({}, req.body), { images: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path });
    const divison = yield product_service_1.productService.updateproduct(id, payload);
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 201,
        message: "product updated successfully",
        success: true,
        data: divison,
    });
}));
const deleteProduct = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_service_1.productService.deleteProduct(req.params.id);
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 201,
        message: "product delete successfully",
        success: true,
        data: product,
    });
}));
exports.ProductController = {
    creatProduct, deleteProduct, getAllProduct, updateProduct
};
