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
const pricestock_model_1 = require("../pricetocks/pricestock.model");
const alldata_model_1 = require("../alldata/alldata.model");
const createProduct = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const ISProductExit = yield pricestock_model_1.PriceStockModel.findOne({ title: payload.title });
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
    // console.log(payload)
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
        // console.log(dupliocateProduct)
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
    // console.log(id)
    const product = yield product_model_1.Product.findById({ _id: id.trim() });
    return {
        data: product
    };
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addToCartIntoDB = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { productId, quantity } = payload;
    // console.log("Processing Cart Input -> Product ID:", productId, "Quantity:", quantity, "User:", userId);
    // ১. PriceStockModel এর বদলে AlldataModel দিয়ে সরাসরি স্ট্রিং _id খুঁজুন
    // যেহেতু আপনার নতুন স্কিমায় _id নিজেই একটি কাস্টম স্ট্রিং, তাই এটি কাস্টম আইডি দিয়ে সরাসরি খুঁজবে
    const product = yield alldata_model_1.AlldataModel.findById(productId);
    // console.log(product);
    if (!product) {
        throw new Error('Product not found in database with the given Daraz ID');
    }
    // ২. স্টকের হিসাব এবং দাম নির্ধারণ করা
    // আপনার নতুন স্কিমা অনুযায়ী মেইন অবজেক্টে totalStock এবং minPrice অথবা বিশেষ দাম আছে।
    const availableQuantity = (_a = product.totalStock) !== null && _a !== void 0 ? _a : 0;
    const itemPrice = product.specialPrice || product.minPrice; // ডিসকাউন্ট প্রাইস থাকলে সেটা নিবে, নয়তো মিনিমাম প্রাইস
    if (availableQuantity < quantity) {
        throw new Error('Insufficient stock available');
    }
    if (!itemPrice) {
        throw new Error('Product price is missing or invalid in database');
    }
    // ৩. ইউজারের কোনো "Pending" অর্ডার/কার্ট অলরেডি তৈরি করা আছে কিনা দেখা
    const cart = yield order_model_1.OrderModel.findOne({ userId, status: 'Pending' });
    if (!cart) {
        // ৪. কার্ট না থাকলে একদম নতুন কার্ট তৈরি করা হচ্ছে
        return yield order_model_1.OrderModel.create({
            userId: userId,
            orderedItems: [{
                    product: productId, // এটি এখন স্ট্রিং আইডি হিসেবে অর্ডার মডেলে সেভ হবে
                    quantity,
                    price: itemPrice
                }],
            totalPrice: itemPrice * quantity,
            status: 'Pending',
        });
    }
    // ৫. কার্ট আগে থেকে থাকলে চেক করা হচ্ছে এই প্রোডাক্ট অলরেডি কার্টে আছে কিনা
    const itemIndex = cart.orderedItems.findIndex(item => item.product.toString() === productId.toString());
    if (itemIndex > -1) {
        // প্রোডাক্ট ইতিমধ্যে কার্টে থাকলে শুধু কোয়ান্টিটি বাড়িয়ে দেওয়া হচ্ছে
        cart.orderedItems[itemIndex].quantity += quantity;
    }
    else {
        // নতুন প্রোডাক্ট হলে পুশ করা হচ্ছে
        cart.orderedItems.push({
            product: productId,
            quantity,
            price: itemPrice
        });
    }
    // ৬. কার্টের টোটাল প্রাইস আবার হিসাব করা
    cart.totalPrice = cart.orderedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    return yield cart.save();
});
exports.productService = {
    createProduct, deleteProduct, addToCartIntoDB, getAllProduct, updateproduct, getproductDetails
};
