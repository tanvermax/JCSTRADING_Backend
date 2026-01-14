import httpStatus from 'http-status-codes';
import AppError from "../../errorHelper/AppError";
import { OrderModel } from "./order.model";

const getAllOrder = async (query: Record<string, string>, userId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { ...query };
    if (userId) {
        filter.userId = userId;
    }
    // console.log("filter",filter)
    const Order = await OrderModel.find(filter).populate('orderedItems.product');

    const totalProduct = await OrderModel.countDocuments();

    return {
        data: Order,
        meta: {
            total: totalProduct
        }
    }
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
    const cleanedItems = orderedItems.map((item: {product:string,quantity:number,price:number}) => ({
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
export const OrderService = {
    getAllOrder, updateOrder, ConfirmOrder, ConfirmOrdernonuser
}