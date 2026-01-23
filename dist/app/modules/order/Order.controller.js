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
    // eslint-disable-next-line no-unsafe-optional-chaining
    const updatedData = req.body;
    if (!updatedData) {
        throw new AppError_1.default(400, "updatedData is missing from request body");
    }
    const { name, phone, address, shippingArea, grandTotal } = updatedData;
    const result = yield order_service_1.OrderService.ConfirmOrder(id, updatedData);
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 202,
        message: "Order shipped Sucessfully",
        success: true,
        data: result,
    });
}));
const confirmOrdernonloguser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedData = req.body;
    if (!updatedData) {
        throw new AppError_1.default(400, "Order data is missing");
    }
    const result = yield order_service_1.OrderService.ConfirmOrdernonuser(updatedData);
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 202,
        message: "Guest Order created successfully",
        success: true,
        data: result,
    });
}));
const deleteOrder = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    const orderId = req.params.id; // This is the ID from the URL
    const { productId } = req.body || {}; // Default to empty object if body is missing
    if (!orderId || orderId === "undefined") {
        throw new AppError_1.default(400, "Order ID is missing in URL");
    }
    // Call service - pass the productId if you are trying to remove a specific item 
    // from an order, or just the orderId if you are deleting the whole order.
    const result = yield order_service_1.OrderService.DeleteOrder(orderId, decodedToken.userId, productId);
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 202,
        message: "Order Delete successfully",
        success: true,
        data: result,
    });
}));
const confirmAdminOrdernonloguser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status, trackingId, courierName } = req.body;
    // Validation
    if (!status || !trackingId || !courierName) {
        throw new AppError_1.default(400, "Status, Tracking ID, and Courier Name are required");
    }
    // Pass 'id' as the first argument
    const result = yield order_service_1.OrderService.ConfirmAdminOrder(id, status, trackingId, courierName);
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 200, // Changed to 200 for standard success
        success: true,
        message: "Order updated and shipped successfully",
        data: result,
    });
}));
const getAllAdminOrder = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    // console.log("query from controller", query)
    const result = yield order_service_1.OrderService.getAllOrderForAdmin(query);
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 200, // Standard GET success code
        message: "All orders retrieved successfully for admin",
        success: true,
        data: result.data,
        meta: result.meta
    });
}));
exports.OrderController = {
    deleteOrder, getAllOrder, getAllAdminOrder, confirmAdminOrdernonloguser, updateOrderStatus, confirmOrder, confirmOrdernonloguser
};
