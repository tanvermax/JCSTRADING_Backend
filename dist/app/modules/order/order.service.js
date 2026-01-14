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
exports.OrderService = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelper/AppError"));
const order_model_1 = require("./order.model");
const getAllOrder = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter = Object.assign({}, query);
    if (userId) {
        filter.userId = userId;
    }
    // console.log("filter",filter)
    const Order = yield order_model_1.OrderModel.find(filter).populate('orderedItems.product');
    const totalProduct = yield order_model_1.OrderModel.countDocuments();
    return {
        data: Order,
        meta: {
            total: totalProduct
        }
    };
});
const updateOrder = (orderId, quantity, productId) => __awaiter(void 0, void 0, void 0, function* () {
    // const { productId, quantity } = body;
    const updatedOrder = yield order_model_1.OrderModel.findOneAndUpdate({
        _id: orderId,
        "orderedItems.product": productId
    }, {
        $set: { "orderedItems.$.quantity": quantity }
    }, { new: true }).populate('orderedItems.product');
    // console.log("orderExists", updatedOrder)
    if (!updatedOrder) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Order not found");
    }
    const newTotalPrice = updatedOrder.orderedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // 3️⃣ Update totalPrice
    updatedOrder.totalPrice = newTotalPrice;
    yield updatedOrder.save();
    return {
        data: updatedOrder,
    };
});
const ConfirmOrder = (orderId, updatedData) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, phone, address, shippingArea, grandTotal, } = updatedData;
    const order = yield order_model_1.OrderModel.findById(orderId);
    if (!order) {
        throw new AppError_1.default(404, "Order not found");
    }
    if (order.status !== "Pending") {
        throw new AppError_1.default(400, "Order already confirmed");
    }
    console.log(order);
    order.shippingAddress = {
        name,
        phone,
        address,
        shippingArea
    };
    order.grandTotal = grandTotal;
    order.status = "Shipped";
    order.paymentStatus = "Pending";
    yield order.save();
    return order;
});
exports.OrderService = {
    getAllOrder, updateOrder, ConfirmOrder
};
