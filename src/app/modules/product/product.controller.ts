import { productService } from './product.service';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendresponse";
import { IProduct } from "./product.interface";
import AppError from '../../errorHelper/AppError';
import { deleteImageForCloudinary } from '../../config/cloudinary.config';



const creatProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    console.log(req.body)
    if (!req.file?.path) {
        throw new AppError(400, "Image upload failed");
    }
    const payload: IProduct = {
        ...req.body,
        images: req.file?.path || null
    }


    const product = await productService.createProduct(payload);
    console.log("product", product)
    if (!product) {
        // Clean up Cloudinary file if DB operation failed
        await deleteImageForCloudinary(req.file?.path);
    }
    sendResponse(res, {

        statusCode: 201,
        message: "product created successfully",
        success: true,
        data: product,
    })
})

const getAllProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    console.log("query from controller", query)
    const result = await productService.getAllProduct(query as Record<string, string>);


    sendResponse(res, {

        statusCode: 201,
        message: "all product retrive  successfully",
        success: true,
        data: result.data,
        meta: result.meta
    })
})

const updateProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params.id;
    const payload: IProduct = {
        ...req.body,
        images: req.file?.path
    }
    const divison = await productService.updateproduct(id, payload)
    sendResponse(res, {
        statusCode: 201,
        message: "product updated successfully",
        success: true,
        data: divison,
    })
})

const deleteProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const product = await productService.deleteProduct(req.params.id)

    sendResponse(res, {

        statusCode: 201,
        message: "product delete successfully",
        success: true,
        data: product,
    })
})

const getproductdetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const product = await productService.getproductDetails(req.params.id)

    console.log("product", product)

    sendResponse(res, {
        statusCode: 201,
        message: "product Details Retrive successfully",
        success: true,
        data: product,
    })
})

const order = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const result = await productService.createOrderIntoDB(req.body);

    // console.log("product",cart)

    sendResponse(res, {
        statusCode: 201,
        message: "Order placed successfully",
        success: true,
        data: result,
    })
})



export const ProductController = {
    creatProduct, order,
    deleteProduct, getAllProduct,
    updateProduct, getproductdetails
}