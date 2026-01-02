import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendresponse";
import { SkuService } from "./sku.service";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAllSku = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;

    console.log("query getAllSku from controller", query)

    const result = await SkuService.getAllSku(query as Record<string, string>);


    sendResponse(res, {

        statusCode: 200,
        message: "all sku retrive  successfully",
        success: true,
        data: result.data,
        meta: result.meta
    })
})





export const SkuController = {
     getAllSku
}