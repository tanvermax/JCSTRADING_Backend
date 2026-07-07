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
const mongoose_1 = require("mongoose");
const sendEmail_1 = require("../../utils/sendEmail");
const user_model_1 = require("../user/user.model");
const getAllOrder = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter = {};
    if (userId)
        filter.userId = new mongoose_1.Types.ObjectId(userId);
    if (query.status)
        filter.status = query.status;
    const orders = yield order_model_1.OrderModel.aggregate([
        // ১. ইউজারের আইডি অনুযায়ী ফিল্টার করা
        { $match: filter },
        // ২. orderedItems অ্যারে ভাঙা
        { $unwind: "$orderedItems" },
        // ৩. মাত্র ১টি সাধারণ lookup (সরাসরি alldata কালেকশন থেকে)
        {
            $lookup: {
                from: "alldata", // কালেকশনের নাম
                localField: "orderedItems.product", // অর্ডারের স্ট্রিং আইডি ("246488514")
                foreignField: "_id", // alldata কালেকশনের স্ট্রিং _id
                as: "productDetails",
            },
        },
        // ৪. lookup এর রেজাল্ট অবজেক্টে রূপান্তর করা
        { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
        // ৫. ফ্রন্টএন্ডের রিকোয়ারমেন্ট অনুযায়ী orderedItems.product ফিল্ড রি-শেপ (Re-shape) করা
        {
            $addFields: {
                "orderedItems.product": {
                    _id: "$productDetails._id",
                    name: "$productDetails.name",
                    images: ["$productDetails.mainImage"], // ফ্রন্টএন্ড যদি ইমেজ অ্যারে চায়
                    category: "$productDetails.category",
                },
            },
        },
        // ৬. আনওয়াইন্ড করা orderedItems গুলোকে আবার আগের মতো গ্রুপ করা
        {
            $group: {
                _id: "$_id",
                userId: { $first: "$userId" },
                orderedItems: { $push: "$orderedItems" },
                totalPrice: { $first: "$totalPrice" },
                grandTotal: { $first: "$grandTotal" },
                status: { $first: "$status" },
                paymentStatus: { $first: "$paymentStatus" },
                shippingAddress: { $first: "$shippingAddress" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
            },
        },
        // ৭. লেটেস্ট অর্ডার অনুযায়ী সর্ট করা
        { $sort: { createdAt: -1 } },
    ]);
    return {
        data: orders,
        meta: { total: orders.length },
    };
});
const updateOrder = (orderId, quantity, productId) => __awaiter(void 0, void 0, void 0, function* () {
    // const { productId, quantity } = body;
    const updatedOrder = yield order_model_1.OrderModel.findOneAndUpdate({
        _id: orderId,
        "orderedItems.product": productId,
    }, {
        $set: { "orderedItems.$.quantity": quantity },
    }, { new: true }).populate("orderedItems.product");
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
    const { name, phone, address, shippingArea, grandTotal } = updatedData;
    console.log("updatedData", updatedData);
    const order = yield order_model_1.OrderModel.findById(orderId);
    if (!order) {
        throw new AppError_1.default(404, "Order not found");
    }
    if (order.status !== "Pending") {
        throw new AppError_1.default(400, "Order already confirmed");
    }
    // 1️⃣ প্রথমে ডাটাবেজের অবজেক্টে ভ্যালুগুলো সেট করুন
    order.shippingAddress = {
        name: name || "Anonymous User",
        phone: Number(phone),
        address: address || "",
        shippingArea: shippingArea
    };
    order.grandTotal = grandTotal;
    order.status = "Pending"; // অথবা আপনার প্রয়োজন অনুযায়ী 'Completed'
    order.paymentStatus = "Pending";
    // 2️⃣ আগে ডাটাবেজে সেভ নিশ্চিত করুন (যাতে ইমেইল ফেইল করলেও অ্যাড্রেস সেভ থাকে)
    yield order.save();
    // 3️⃣ ইউজার খোঁজা
    const user = yield user_model_1.User.findById(order.userId);
    if (!user) {
        throw new AppError_1.default(404, "User not found");
    }
    console.log("hi", user);
    // 4️⃣ ইমেইল পাঠানো (এটিকে try-catch বা .catch দিয়ে আইসোলেট করা হলো)
    if (user.email) {
        yield (0, sendEmail_1.sendEmail)({
            to: user.email,
            subject: `Your JCS Trading Order #${order._id} is Confirmed!`,
            templateName: "orderConfirmation",
            templateData: {
                name: name,
                orderId: order._id,
                status: order.status,
                totalPrice: order.grandTotal,
            },
        }).catch((err) => {
            // ইমেইল না গেলেও যেন প্রজেক্ট ক্র্যাশ না করে, জাস্ট লগ হবে
            console.log("Email sending failed but order saved: ", err.message);
        });
    }
    return order;
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ConfirmOrdernonuser = (updatedData) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderedItems, name, phone, address, shippingArea, grandTotal, email, } = updatedData;
    console.log("updatedData", updatedData);
    const cleanedItems = orderedItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
    }));
    const result = yield order_model_1.OrderModel.create({
        email: email || "",
        orderedItems: cleanedItems,
        totalPrice: grandTotal - (shippingArea === "inside" ? 60 : 120),
        grandTotal,
        status: "Pending",
        paymentStatus: "Pending",
        shippingAddress: { name, phone, address, shippingArea },
    });
    // 1️⃣ কাস্টমারকে কনফার্মেশন মেইল পাঠানো (যদি ইমেইল দিয়ে থাকে)
    if (email) {
        yield (0, sendEmail_1.sendEmail)({
            to: email,
            subject: `Your JCS Trading Guest Order #${result._id} is Placed!`,
            templateName: "orderConfirmation",
            templateData: {
                name: name,
                orderId: result._id,
                status: result.status,
                totalPrice: grandTotal,
                trackingId: "",
                courierName: "",
            },
        }).catch((err) => console.log("Customer Email error: ", err.message));
    }
    // 2️⃣ ওয়েবসাইট ওনার/অ্যাডমিনকে প্রফেশনাল অ্যালার্ট মেইল পাঠানো (এটি সবসময় যাবে)
    yield (0, sendEmail_1.sendEmail)({
        to: 'jcstrading2022@gmail.com', // ওনারের ইমেইল
        subject: `🚨 New Order Alert - #${result._id} [${name}]`, // প্রফেশনাল সাবজেক্ট
        templateName: "adminOrderAlert", // নতুন তৈরি করা EJS টেমপ্লেট
        templateData: {
            name: name,
            phone: phone,
            customerEmail: email || "Not Provided",
            address: address,
            shippingArea: shippingArea,
            orderId: result._id,
            grandTotal: grandTotal,
            itemsCount: cleanedItems.length // কয়টা প্রোডাক্ট অর্ডার করেছে
        },
    }).catch((err) => console.log("Admin Email error: ", err.message));
    return result;
});
const DeleteOrder = (orderId, userId, productId) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.OrderModel.findOne({ _id: orderId, userId: userId });
    if (!order) {
        throw new AppError_1.default(404, "Order not found or unauthorized");
    }
    // 2. Find the specific item in the array to get its total cost (price * quantity)
    const itemToDelete = order.orderedItems.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item) => item.product.toString() === productId);
    if (!itemToDelete) {
        throw new AppError_1.default(404, "Product not found in this order");
    }
    const amountToSubtract = itemToDelete.price * itemToDelete.quantity;
    // 3. Update the document: Remove the item and decrement the totalPrice
    const updatedOrder = yield order_model_1.OrderModel.findOneAndUpdate({ _id: orderId, userId: userId }, {
        $pull: { orderedItems: { product: productId } }, // Removes the object from array
        $inc: { totalPrice: -amountToSubtract }, // Subtracts the cost from totalPrice
    }, { new: true });
    // 4. Cleanup: If the order is now empty, you might want to delete the whole order
    if (updatedOrder && updatedOrder.orderedItems.length === 0) {
        yield order_model_1.OrderModel.findByIdAndDelete(orderId);
        return { message: "Order deleted because no items remained", data: null };
    }
    return updatedOrder;
});
const ConfirmAdminOrder = (id, status, trackingId, courierName) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Clean the items array: Remove the 'guest_...' IDs and extra UI fields
    const updatedOrder = yield order_model_1.OrderModel.findByIdAndUpdate(id, {
        status,
        trackingId,
        courierName,
        // Note: 'updatedAt' is handled automatically by Mongoose 'timestamps: true'
    }, { new: true, runValidators: true });
    if (!updatedOrder) {
        throw new AppError_1.default(404, "Order not found");
    }
    if (updatedOrder.email) {
        yield (0, sendEmail_1.sendEmail)({
            to: updatedOrder.email,
            subject: `JCS Trading Order #${updatedOrder._id} Update: ${status}`,
            templateName: "orderConfirmation",
            templateData: {
                name: ((_a = updatedOrder.shippingAddress) === null || _a === void 0 ? void 0 : _a.name) || "Customer",
                orderId: updatedOrder._id,
                status: status,
                totalPrice: updatedOrder.grandTotal || updatedOrder.totalPrice,
                trackingId: trackingId,
                courierName: courierName,
            },
        }).catch((err) => console.log("Email error: ", err.message));
    }
    return updatedOrder;
});
const getAllOrderForAdmin = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter = {};
    if (query.status)
        filter.status = query.status;
    const orders = yield order_model_1.OrderModel.aggregate([
        { $match: filter },
        { $unwind: { path: "$orderedItems", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "alldata", // নিশ্চিত হয়ে নিন কালেকশন নেম ঠিক আছে কিনা
                localField: "orderedItems.product",
                foreignField: "_id",
                as: "productDetails",
            },
        },
        { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
        {
            $addFields: {
                "orderedItems.product": {
                    $cond: {
                        if: { $ifNull: ["$productDetails", false] },
                        then: {
                            _id: "$productDetails._id",
                            name: "$productDetails.name",
                            productName: "$productDetails.name",
                            images: ["$productDetails.mainImage"],
                            mainImage: "$productDetails.mainImage",
                        },
                        else: "$orderedItems.product",
                    },
                },
            },
        },
        {
            $group: {
                _id: "$_id",
                orderedItems: { $push: "$orderedItems" },
                totalPrice: { $first: "$totalPrice" },
                grandTotal: { $first: "$grandTotal" },
                status: { $first: "$status" },
                courierName: { $first: "$courierName" },
                trackingId: { $first: "$trackingId" },
                paymentStatus: { $first: "$paymentStatus" },
                shippingAddress: { $first: "$shippingAddress" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
            },
        },
        { $sort: { createdAt: -1 } },
    ]);
    return {
        data: orders,
        meta: { total: orders.length },
    };
});
exports.OrderService = {
    getAllOrder,
    updateOrder,
    getAllOrderForAdmin,
    ConfirmAdminOrder,
    ConfirmOrder,
    ConfirmOrdernonuser,
    DeleteOrder,
};
