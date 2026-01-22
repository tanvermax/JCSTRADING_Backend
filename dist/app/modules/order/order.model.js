"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModel = void 0;
const mongoose_1 = require("mongoose");
const orderSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId || String, ref: 'User', },
    orderedItems: [
        {
            _id: false,
            product: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    totalPrice: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Shipped', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Success', 'Failed'],
        default: 'Pending'
    },
    grandTotal: { type: Number },
    transactionId: { type: String },
    shippingAddress: {
        name: { type: String },
        phone: { type: Number },
        address: { type: String },
        shippingArea: {
            type: String,
            enum: ['inside', 'outside']
        }
    }
}, {
    timestamps: true
});
exports.OrderModel = (0, mongoose_1.model)('Order', orderSchema);
