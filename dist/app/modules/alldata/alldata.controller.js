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
exports.AlldataController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendresponse_1 = require("../../utils/sendresponse");
const AppError_1 = __importDefault(require("../../errorHelper/AppError"));
const cloudinary_config_1 = require("../../config/cloudinary.config");
const alldata_service_1 = require("./alldata.service");
const getAllProducts = (0, catchAsync_1.catchAsync)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield alldata_service_1.alldataService.getAllProducts(query);
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 200,
        message: 'Products fetched successfully',
        success: true,
        data: result.data,
        meta: result.meta,
    });
}));
const getSingleProduct = (0, catchAsync_1.catchAsync)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield alldata_service_1.alldataService.getSingleProduct(id);
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 200,
        message: 'Product details fetched successfully',
        success: true,
        data: result,
    });
}));
const createProduct = (0, catchAsync_1.catchAsync)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let parsedData;
    try {
        parsedData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    }
    catch (error) {
        throw new AppError_1.default(400, 'Invalid JSON data format');
    }
    // image upload optional here — payload may already carry mainImage/images
    // from the frontend if you're not using multer for this route
    const finalPayload = ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path)
        ? Object.assign(Object.assign({}, parsedData), { mainImage: req.file.path }) : parsedData;
    const product = yield alldata_service_1.alldataService.createProduct(finalPayload);
    if (!product) {
        if ((_b = req.file) === null || _b === void 0 ? void 0 : _b.path)
            yield (0, cloudinary_config_1.deleteImageForCloudinary)(req.file.path);
        throw new AppError_1.default(500, 'Failed to create product in database');
    }
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 201,
        message: 'Product created successfully',
        success: true,
        data: product,
    });
}));
const updateProduct = (0, catchAsync_1.catchAsync)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    let parsedData;
    try {
        parsedData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    }
    catch (error) {
        throw new AppError_1.default(400, 'Invalid JSON data format');
    }
    const finalPayload = ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path)
        ? Object.assign(Object.assign({}, parsedData), { mainImage: req.file.path }) : parsedData;
    const product = yield alldata_service_1.alldataService.updateProduct(id, finalPayload);
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 200,
        message: 'Product updated successfully',
        success: true,
        data: product,
    });
}));
const deleteProduct = (0, catchAsync_1.catchAsync)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const product = yield alldata_service_1.alldataService.deleteProduct(id);
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 200,
        message: 'Product deleted successfully',
        success: true,
        data: product,
    });
}));
const getAdminOverview = (0, catchAsync_1.catchAsync)((_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield alldata_service_1.alldataService.getAdminOverview();
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 200,
        message: 'Admin overview fetched successfully',
        success: true,
        data: result,
    });
}));
const getCategories = (0, catchAsync_1.catchAsync)((_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield alldata_service_1.alldataService.getCategories();
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 200,
        message: 'Categories fetched successfully',
        success: true,
        data: result,
    });
}));
exports.AlldataController = {
    getAllProducts,
    getSingleProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getAdminOverview,
    getCategories,
};
