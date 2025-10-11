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
exports.productService = void 0;
// src/types/product.ts
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelper/AppError"));
const product_model_1 = require("./product.model");
const cloudinary_config_1 = require("../../config/cloudinary.config");
const createProduct = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const ISProductExit = yield product_model_1.Product.findOne({ title: payload.title });
    console.log(ISProductExit);
    if (ISProductExit) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Product alredy exit in");
    }
    const baseSlug = payload.title.toLocaleLowerCase().split(" ").join("-");
    let counter = 0;
    let slug = `${baseSlug}-product`;
    while (yield product_model_1.Product.exists({ slug })) {
        slug = `${slug}-${counter++}`;
    }
    payload.slug = slug;
    console.log(payload);
    const product = product_model_1.Product.create(payload);
    return product;
});
const getAllProduct = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = query;
    console.log(filter);
    const product = yield product_model_1.Product.find(filter);
    const totalProduct = yield product_model_1.Product.countDocuments();
    return {
        data: product,
        meta: {
            total: totalProduct
        }
    };
});
const updateproduct = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const ifProduct = yield product_model_1.Product.findById(id);
    if (!ifProduct) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Product not found");
    }
    const dupliocateProduct = yield product_model_1.Product.findOne({
        title: payload.title,
        _id: { $ne: id }
    });
    if (dupliocateProduct) {
        console.log(dupliocateProduct);
        throw new Error("Product already exits");
    }
    if (payload.title) {
        // const { title, slug, description, thumbnile } = paylod;
        const baseSlug = payload.title.toLocaleLowerCase().split(" ").join("-");
        let counter = 0;
        let slug = `${baseSlug}-product`;
        while (yield product_model_1.Product.exists({ slug })) {
            slug = `${slug}-${counter++}`;
        }
        payload.slug = slug;
    }
    const newProduct = yield product_model_1.Product.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (payload.images && ifProduct.images) {
        yield (0, cloudinary_config_1.deleteImageForCloudinary)(ifProduct.images);
    }
    return newProduct;
});
const deleteProduct = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield product_model_1.Product.findByIdAndDelete(id);
    return null;
});
exports.productService = {
    createProduct, deleteProduct, getAllProduct, updateproduct
};
