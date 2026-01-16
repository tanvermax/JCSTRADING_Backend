
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendresponse";
import { pstockService } from "./pstocke.service";





const getAllPstokes = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    // console.log("query from controller", query)
    const result = await pstockService.getAllPStock(query as Record<string, string>);


    sendResponse(res, {

        statusCode: 201,
        message: "all Price Stokes data   successfully",
        success: true,
        data: result.data,
        meta: result.meta
    })
})




export const PstokesController = {
 getAllPstokes,
 
}