
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendresponse";
import { OrderModel } from "./order.model";
import { OrderService } from "./order.service";
import { JwtPayload } from "jsonwebtoken";




const getAllOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload
    const query = req.query;
    // console.log("query from controller", query)
    const result = await OrderService.getAllOrder(query as Record<string, string>,decodedToken.userId);


    sendResponse(res, {

        statusCode: 201,
        message: "all product retrive  successfully",
        success: true,
        data: result.data,
        meta: result.meta
    })
})




export const OrderController = {
    getAllOrder
}