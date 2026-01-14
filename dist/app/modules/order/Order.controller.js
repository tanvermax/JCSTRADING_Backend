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
exports.OrderController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendresponse_1 = require("../../utils/sendresponse");
const order_service_1 = require("./order.service");
const AppError_1 = __importDefault(require("../../errorHelper/AppError"));
const getAllOrder = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    const query = req.query;
    // console.log("query from controller", query)
    const result = yield order_service_1.OrderService.getAllOrder(query, decodedToken.userId);
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 201,
        message: "User order retrive successfully",
        success: true,
        data: result.data,
        meta: result.meta
    });
}));
const updateOrderStatus = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    // const productId = req.query;
    const { productId, quantity } = req.body;
    console.log("query from controller", productId);
    console.log("quantity", quantity);
    console.log("id", id);
    if (!productId) {
        throw new AppError_1.default(400, "Invalid productId ");
    }
    if (typeof quantity !== "number") {
        throw new AppError_1.default(400, "Invalid body parameters");
    }
    const result = yield order_service_1.OrderService.updateOrder(id, quantity, productId);
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 202,
        message: "Order data updated !",
        success: true,
        data: result.data,
    });
}));
const confirmOrder = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    // 1. Get the wrapper object
    console.log("Body received:", req.body);
    console.log("id received:", id);
    // eslint-disable-next-line no-unsafe-optional-chaining
    const updatedData = req.body;
    console.log("updatatedData", updatedData);
    if (!updatedData) {
        throw new AppError_1.default(400, "updatedData is missing from request body");
    }
    const { name, phone, address, shippingArea, grandTotal } = updatedData;
    // 3. Pass updatedData to your service
    const result = yield order_service_1.OrderService.ConfirmOrder(id, updatedData);
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 202,
        message: "Order shipped Sucessfully",
        success: true,
        data: result,
    });
}));
exports.OrderController = {
    getAllOrder, updateOrderStatus, confirmOrder
};
