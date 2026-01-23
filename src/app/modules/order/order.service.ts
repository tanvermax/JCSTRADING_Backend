import httpStatus from 'http-status-codes';
import AppError from "../../errorHelper/AppError";
import { OrderModel } from "./order.model";
import { Types } from 'mongoose';

const getAllOrder = async (query: Record<string, string>, userId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (userId) filter.userId = new Types.ObjectId(userId);

    // Add other query filters if necessary (e.g. status: 'Pending')
    if (query.status) filter.status = query.status;

    const orders = await OrderModel.aggregate([
        { $match: filter },
        { $unwind: "$orderedItems" },
        // 1. Join with pricestock
        {
            $lookup: {
                from: "pricestock",
                localField: "orderedItems.product",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        { $unwind: "$productDetails" },
        // 2. Join with besic collection
        {
            $lookup: {
                from: "besic",
                localField: "productDetails.Product ID",
                foreignField: "Product ID",
                as: "basicInfo"
            }
        },
        { $unwind: { path: "$basicInfo", preserveNullAndEmptyArrays: true } },
        // 3. FIX: Use $mergeObjects to combine product details with basic info
        {
            $addFields: {
                "orderedItems.product": {
                    $mergeObjects: [
                        "$productDetails",
                        {
                            images: "$basicInfo.*Product Images1",
                            highlights: "$basicInfo.Highlights"
                        }
                    ]
                }
            }
        },
        // 4. Group back into the original order structure
        {
            $group: {
                _id: "$_id",
                userId: { $first: "$userId" },
                orderedItems: { $push: "$orderedItems" },
                totalPrice: { $first: "$totalPrice" },
                status: { $first: "$status" },
                paymentStatus: { $first: "$paymentStatus" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
                // Include other fields if your schema has them
                shippingAddress: { $first: "$shippingAddress" },
                grandTotal: { $first: "$grandTotal" }
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    return {
        data: orders,
        meta: { total: orders.length }
    };
}


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
    order.status = "Shipped";
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
        status: "Shipped",
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
        {
            $unwind: {
                path: "$orderedItems",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "pricestock", 
                localField: "orderedItems.product",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        { 
            $unwind: { 
                path: "$productDetails", 
                preserveNullAndEmptyArrays: true 
            } 
        },
        // 4. Lookup basic info
        {
            $lookup: {
                from: "besic", 
                localField: "productDetails.Product ID",
                foreignField: "Product ID",
                as: "basicInfo"
            }
        },
       { $unwind: { path: "$basicInfo", preserveNullAndEmptyArrays: true } },
        // 5. Build the product object safely
      {
            $addFields: {
                "orderedItems.product": {
                    $cond: {
                        // Check if productDetails exists as an object
                        if: { $ifNull: ["$productDetails", false] },
                        then: {
                            $mergeObjects: [
                                "$productDetails",
                                {
                                    images: "$basicInfo.*Product Images1",
                                    productName: "$basicInfo.*Product Name(English)"
                                }
                            ]
                        },
                        else: "$orderedItems.product" // Keep original if no lookup match
                    }
                }
            }
        },

        // 6. Group back together
        {
            $group: {
                _id: "$_id",
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
       {
            $addFields: {
                orderedItems: {
                    $filter: {
                        input: "$orderedItems",
                        as: "item",
                        cond: { $ne: ["$$item", {}] }
                    }
                }
            }
        },
        { $sort: { createdAt: -1 } }
    ]);
   

    return {
        data: orders,
        meta: { total: orders.length }
    };
}
export const OrderService = {
    getAllOrder, updateOrder, getAllOrderForAdmin, ConfirmAdminOrder, ConfirmOrder, ConfirmOrdernonuser, DeleteOrder
}