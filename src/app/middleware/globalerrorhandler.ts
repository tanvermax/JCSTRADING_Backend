import { NextFunction, Request, Response } from "express";
import { handleDuplicateError } from "../helper/handleDuplicateError";
import { handleCastError } from "../helper/handleCastError";
import { handleValidationerror } from "../helper/handleValidationError";
import { Zodvalidation } from "../helper/zodValidation";
import AppError from "../errorHelper/AppError";
import { envVarse } from "../config/env";
import httpStatus from 'http-status-codes';
import { TErrorSources } from "../intreface/error.types";
import { deleteImageForCloudinary } from "../config/cloudinary.config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log({ file: req.files });
    console.error(`Error on: ${req.method} ${req.originalUrl}`);
    if (req.file) {
        await deleteImageForCloudinary(req.file.path)
    }

    if (req.files && Array.isArray(req.files) && req.files.length) {
        const imageUrls = (req.files as Express.Multer.File[]).map(file => file.path)

        await Promise.all(imageUrls.map(url => deleteImageForCloudinary(url)))
    }

    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    let message = err.message || "Something went wrong!!";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let errorSources: TErrorSources[] = [];
    // eslint-disable-next-line prefer-const
    // let stack = envVarse.NODE_ENV === "devolopment" ? err.stack : null;

    if (err.code === 11000) {
        const simplifiedError = handleDuplicateError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources as TErrorSources[];
    } else if (err.name === "CastError") {
        const simplifiedError = handleCastError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources as TErrorSources[];
    } else if (err.name === "ValidationError") {
        const simplifiedError = handleValidationerror(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources as TErrorSources[];
    } else if (err.name === "ZodError") {
        const simplifiedError = Zodvalidation(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources as TErrorSources[];
    } else if (err instanceof AppError) {
        // 💡 এই ব্লকটি আপনার 401 ত্রুটিটিকে ধরা উচিত
        statusCode = err.statusCode;
        message = err.message;
        errorSources = [{ path: "", message: err.message }];
        // 💡 DEBUGGING: এখানে লগ যোগ করুন
        console.log(`Global Handler Caught AppError: Status ${statusCode}, Message: ${message}`);
    } else if (err instanceof Error) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        message = err.message;
        errorSources = [{ path: "", message: err.message }];
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err: envVarse.NODE_ENV === "development" ? err : null,
        stack: envVarse.NODE_ENV === "development" ? err.stack : null
    });
};