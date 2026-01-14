
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
    const updatedData  = req.body

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

export const OrderController = {
    getAllOrder, updateOrderStatus, confirmOrder,confirmOrdernonloguser
}