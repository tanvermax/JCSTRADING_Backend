
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendresponse";
import { OrderModel } from "./order.model";
import { OrderService } from "./order.service";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelper/AppError";




const getAllOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload
    const query = req.query;
    // console.log("query from controller", query)
    const result = await OrderService.getAllOrder(query as Record<string, string>, decodedToken.userId);


    sendResponse(res, {

        statusCode: 201,
        message: "User order retrive successfully",
        success: true,
        data: result.data,
        meta: result.meta
    })
})

const updateOrderStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    // const productId = req.query;
    const { productId, quantity } = req.body;

    console.log("query from controller", productId)

    console.log("quantity", quantity)

    console.log("id", id)

    if (!productId) {
        throw new AppError(400, "Invalid productId ");
    }
    if (typeof quantity !== "number") {
        throw new AppError(400, "Invalid body parameters");
    }



    const result = await OrderService.updateOrder(id, quantity, productId);


    sendResponse(res, {
        statusCode: 202,
        message: "Order data updated !",
        success: true,
        data: result.data,

    })
})

const confirmOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params.id;
    // eslint-disable-next-line no-unsafe-optional-chaining
    const updatedData = req.body

    if (!updatedData) {
        throw new AppError(400, "updatedData is missing from request body");
    }
    const { name, phone, address, shippingArea, grandTotal } = updatedData;

    const result = await OrderService.ConfirmOrder(id, updatedData);

    sendResponse(res, {
        statusCode: 202,
        message: "Order shipped Sucessfully",
        success: true,
        data: result,
    });
})

const confirmOrdernonloguser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const updatedData = req.body;

    if (!updatedData) {
        throw new AppError(400, "Order data is missing");
    }
    const result = await OrderService.ConfirmOrdernonuser(updatedData);

    sendResponse(res, {
        statusCode: 202,
        message: "Guest Order created successfully",
        success: true,
        data: result,
    });
})


const deleteOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const orderId = req.params.id; // This is the ID from the URL
    const { productId } = req.body || {}; // Default to empty object if body is missing

    if (!orderId || orderId === "undefined") {
        throw new AppError(400, "Order ID is missing in URL");
    }

    // Call service - pass the productId if you are trying to remove a specific item 
    // from an order, or just the orderId if you are deleting the whole order.
    const result = await OrderService.DeleteOrder(orderId, decodedToken.userId, productId);

    sendResponse(res, {
        statusCode: 202,
        message: "Order Delete successfully",
        success: true,
        data: result,
    });
})

const confirmAdminOrdernonloguser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const { id } = req.params;
    const { status, trackingId, courierName } = req.body;

    // Validation
    if (!status || !trackingId || !courierName) {
        throw new AppError(400, "Status, Tracking ID, and Courier Name are required");
    }

    // Pass 'id' as the first argument
    const result = await OrderService.ConfirmAdminOrder(
        id,
        status,
        trackingId,
        courierName
    );

    sendResponse(res, {
        statusCode: 200, // Changed to 200 for standard success
        success: true,
        message: "Order updated and shipped successfully",
        data: result,
    });

});

const getAllAdminOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    
    const query = req.query;
    // console.log("query from controller", query)
    const result = await OrderService.getAllOrderForAdmin(query as Record<string, string>);


    sendResponse(res, {
        statusCode: 200, // Standard GET success code
        message: "All orders retrieved successfully for admin",
        success: true,
        data: result.data,
        meta: result.meta
    });
});


export const OrderController = {
    deleteOrder, getAllOrder,getAllAdminOrder, confirmAdminOrdernonloguser, updateOrderStatus, confirmOrder, confirmOrdernonloguser
}