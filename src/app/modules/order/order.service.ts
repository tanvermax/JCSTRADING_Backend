import httpStatus from 'http-status-codes';
import AppError from "../../errorHelper/AppError";
import { OrderModel } from "./order.model";
import { Types } from 'mongoose';

const getAllOrder = async (query: Record<string, string>, userId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (userId) filter.userId = new Types.ObjectId(userId);

    if (query.status) filter.status = query.status;

    const orders = await OrderModel.aggregate([
        // ১. ইউজারের আইডি অনুযায়ী ফিল্টার করা
        { $match: filter },
        
        // ২. orderedItems অ্যারে ভাঙা
        { $unwind: "$orderedItems" },
        
        // ৩. মাত্র ১টি সাধারণ lookup (সরাসরি alldata কালেকশন থেকে)
        {
            $lookup: {
                from: "alldata",               // কালেকশনের নাম
                localField: "orderedItems.product", // অর্ডারের স্ট্রিং আইডি ("246488514")
                foreignField: "_id",           // alldata কালেকশনের স্ট্রিং _id
                as: "productDetails"
            }
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
                    category: "$productDetails.category"
                }
            }
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
                updatedAt: { $first: "$updatedAt" }
            }
        },
        
        // ৭. লেটেস্ট অর্ডার অনুযায়ী সর্ট করা
        { $sort: { createdAt: -1 } }
    ]);

    return {
        data: orders,
        meta: { total: orders.length }
    };
};



const updateOrder = async (orderId: string, quantity: number, productId: string) => {

    // const { productId, quantity } = body;


    const updatedOrder = await OrderModel.findOneAndUpdate(
        {
            _id: orderId,
            "orderedItems.product": productId
        },
        {
            $set: { "orderedItems.$.quantity": quantity }
        },
        { new: true }
    ).populate('orderedItems.product');


    // console.log("orderExists", updatedOrder)

    if (!updatedOrder) {
        throw new AppError(httpStatus.BAD_REQUEST, "Order not found")
    }



    const newTotalPrice = updatedOrder.orderedItems.reduce(
        (sum, item: { price: number, quantity: number }) => sum + item.price * item.quantity,
        0
    );

    // 3️⃣ Update totalPrice
    updatedOrder.totalPrice = newTotalPrice;

    await updatedOrder.save();

    return {
        data: updatedOrder,

    }
}


const ConfirmOrder = async (orderId: string, updatedData: { name: string, phone: number, address: string, shippingArea: string, grandTotal: number, status: string }) => {

    const {
        name,
        phone,
        address,
        shippingArea,
        grandTotal,

    } = updatedData;

    const order = await OrderModel.findById(orderId);
    if (!order) {
        throw new AppError(404, "Order not found");
    }
    if (order.status !== "Pending") {
        throw new AppError(400, "Order already confirmed");
    }

    //   console.log(order)
    order.shippingAddress = {
        name,
        phone,
        address,
        shippingArea
    };

    order.grandTotal = grandTotal;
    order.status = "Completed";
    order.paymentStatus = "Pending";

    await order.save();

    return order;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ConfirmOrdernonuser = async (updatedData: any) => {
    const { orderedItems, name, phone, address, shippingArea, grandTotal } = updatedData;

    // Clean the items array: Remove the 'guest_...' IDs and extra UI fields
    const cleanedItems = orderedItems.map((item: { product: string, quantity: number, price: number }) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price
    }));

    const result = await OrderModel.create({
        orderedItems: cleanedItems, // Pass the cleaned array here
        totalPrice: grandTotal - (shippingArea === "inside" ? 60 : 120),
        grandTotal,
        status: "Completed",
        paymentStatus: "Pending",
        shippingAddress: { name, phone, address, shippingArea }
    });

    return result;
};



const DeleteOrder = async (orderId: string, userId: string, productId: string) => {

    const order = await OrderModel.findOne({ _id: orderId, userId: userId });

    if (!order) {
        throw new AppError(404, "Order not found or unauthorized");
    }

    // 2. Find the specific item in the array to get its total cost (price * quantity)
    const itemToDelete = order.orderedItems.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) => item.product.toString() === productId
    );

    if (!itemToDelete) {
        throw new AppError(404, "Product not found in this order");
    }

    const amountToSubtract = itemToDelete.price * itemToDelete.quantity;

    // 3. Update the document: Remove the item and decrement the totalPrice
    const updatedOrder = await OrderModel.findOneAndUpdate(
        { _id: orderId, userId: userId },
        {
            $pull: { orderedItems: { product: productId } }, // Removes the object from array
            $inc: { totalPrice: -amountToSubtract }        // Subtracts the cost from totalPrice
        },
        { new: true } // Return the updated document to the frontend
    );

    // 4. Cleanup: If the order is now empty, you might want to delete the whole order
    if (updatedOrder && updatedOrder.orderedItems.length === 0) {
        await OrderModel.findByIdAndDelete(orderId);
        return { message: "Order deleted because no items remained", data: null };
    }

    return updatedOrder;
};


const ConfirmAdminOrder = async (id: string, status: string, trackingId: string, courierName: string) => {

    // Clean the items array: Remove the 'guest_...' IDs and extra UI fields
    const updatedOrder = await OrderModel.findByIdAndUpdate(
        id,
        {
            status,
            trackingId,
            courierName,
            // Note: 'updatedAt' is handled automatically by Mongoose 'timestamps: true'
        },
        { new: true, runValidators: true } // runValidators ensures enum values are checked
    );
    if (!updatedOrder) {
        throw new AppError(404, "Order not found");
    }

    return updatedOrder;
};


const getAllOrderForAdmin = async (query: Record<string, string>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (query.status) filter.status = query.status;

    const orders = await OrderModel.aggregate([
        { $match: filter },
        { $unwind: { path: "$orderedItems", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "alldata", // নিশ্চিত হয়ে নিন কালেকশন নেম ঠিক আছে কিনা
                localField: "orderedItems.product",
                foreignField: "_id",
                as: "productDetails"
            }
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
                            mainImage: "$productDetails.mainImage"
                        },
                        else: "$orderedItems.product"
                    }
                }
            }
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
                updatedAt: { $first: "$updatedAt" }
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    return {
        data: orders,
        meta: { total: orders.length }
    };
};


export const OrderService = {
    getAllOrder, updateOrder, getAllOrderForAdmin, ConfirmAdminOrder, ConfirmOrder, ConfirmOrdernonuser, DeleteOrder
}