// import  httpStatus from 'http-status-codes';

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendresponse";
import { pstockService } from "./pstocke.service";
import { PriceStockModel } from "./pricestock.model";
// import AppError from "../../errorHelper/AppError";






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

const getSinglePStock = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const  {id}  = req.params;

    console.log("id", id)

    const productfound = await PriceStockModel.findById(id);
    
    console.log("productfound",productfound)

    const result = await pstockService.getSinglePStock(id);

    // if (!result) {
    //     throw new AppError(httpStatus.NOT_FOUND, "Product not found");
    // }
    console.log()

    sendResponse(res, {
        statusCode: 200,
        message: "Product details fetched successfully",
        success: true,
        data: result
    });
});


export const PstokesController = {
    getAllPstokes, getSinglePStock

}