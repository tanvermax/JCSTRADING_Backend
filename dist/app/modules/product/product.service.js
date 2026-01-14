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
const order_model_1 = require("../order/order.model");
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
    // console.log("filter",filter)
    const product = yield product_model_1.Product.find(filter);
    // console.log(product)
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
const getproductDetails = (id) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(id);
    const product = yield product_model_1.Product.findById({ _id: id.trim() });
    return {
        data: product
    };
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addToCartIntoDB = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, quantity, } = payload;
    console.log("productId, quantity, userId", productId, quantity, userId);
    const product = yield product_model_1.Product.findById(productId);
    if (!product || !product.stock || product.stock == null)
        throw new Error('Stock issue');
    if (!product.price)
        throw new Error('price issue');
    if (!product || product.stock < quantity)
        throw new Error('Stock issue');
    // 1. Find if the user already has a "Pending" order (their Cart)
    // eslint-disable-next-line prefer-const
    let cart = yield order_model_1.OrderModel.findOne({ userId: userId, status: 'Pending' });
    if (!cart) {
        // 2. No cart? Create one with this item
        return yield order_model_1.OrderModel.create({
            userId: userId,
            orderedItems: [{ product: productId, quantity, price: product.price }],
            totalPrice: product.price * quantity,
            status: 'Pending',
        });
    }
    // 3. Cart exists? Check if product is already in the array
    const itemIndex = cart.orderedItems.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
        // Increase quantity of existing item
        cart.orderedItems[itemIndex].quantity += quantity;
    }
    else {
        // Add new item to the array
        cart.orderedItems.push({ product: productId, quantity, price: product.price });
    }
    // 4. Recalculate Total
    cart.totalPrice = cart.orderedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    return yield cart.save();
});
exports.productService = {
    createProduct, deleteProduct, addToCartIntoDB, getAllProduct, updateproduct, getproductDetails
};
