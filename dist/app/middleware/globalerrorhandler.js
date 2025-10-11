"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const handleDuplicateError_1 = require("../helper/handleDuplicateError");
const handleCastError_1 = require("../helper/handleCastError");
const handleValidationError_1 = require("../helper/handleValidationError");
const zodValidation_1 = require("../helper/zodValidation");
const AppError_1 = __importDefault(require("../errorHelper/AppError"));
const env_1 = require("../config/env");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const cloudinary_config_1 = require("../config/cloudinary.config");
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const globalErrorHandler = (err, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log({ file: req.files });
    console.error(`Error on: ${req.method} ${req.originalUrl}`);
    if (req.file) {
        yield (0, cloudinary_config_1.deleteImageForCloudinary)(req.file.path);
    }
    if (req.files && Array.isArray(req.files) && req.files.length) {
        const imageUrls = req.files.map(file => file.path);
        yield Promise.all(imageUrls.map(url => (0, cloudinary_config_1.deleteImageForCloudinary)(url)));
    }
    let statusCode = http_status_codes_1.default.INTERNAL_SERVER_ERROR;
    let message = err.message || "Something went wrong!!";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let errorSources = [];
    // eslint-disable-next-line prefer-const
    // let stack = envVarse.NODE_ENV === "devolopment" ? err.stack : null;
    if (err.code === 11000) {
        const simplifiedError = (0, handleDuplicateError_1.handleDuplicateError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    }
    else if (err.name === "CastError") {
        const simplifiedError = (0, handleCastError_1.handleCastError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    }
    else if (err.name === "ValidationError") {
        const simplifiedError = (0, handleValidationError_1.handleValidationerror)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    }
    else if (err.name === "ZodError") {
        const simplifiedError = (0, zodValidation_1.Zodvalidation)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    }
    else if (err instanceof AppError_1.default) {
        // 💡 এই ব্লকটি আপনার 401 ত্রুটিটিকে ধরা উচিত
        statusCode = err.statusCode;
        message = err.message;
        errorSources = [{ path: "", message: err.message }];
        // 💡 DEBUGGING: এখানে লগ যোগ করুন
        console.log(`Global Handler Caught AppError: Status ${statusCode}, Message: ${message}`);
    }
    else if (err instanceof Error) {
        statusCode = http_status_codes_1.default.INTERNAL_SERVER_ERROR;
        message = err.message;
        errorSources = [{ path: "", message: err.message }];
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err: env_1.envVarse.NODE_ENV === "development" ? err : null,
        stack: env_1.envVarse.NODE_ENV === "development" ? err.stack : null
    });
});
exports.globalErrorHandler = globalErrorHandler;
