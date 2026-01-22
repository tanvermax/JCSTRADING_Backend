"use strict";
// import  httpStatus from 'http-status-codes';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PstokesController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendresponse_1 = require("../../utils/sendresponse");
const pstocke_service_1 = require("./pstocke.service");
const pricestock_model_1 = require("./pricestock.model");
// import AppError from "../../errorHelper/AppError";
const getAllPstokes = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    // console.log("query from controller", query)
    const result = yield pstocke_service_1.pstockService.getAllPStock(query);
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 201,
        message: "all Price Stokes data   successfully",
        success: true,
        data: result.data,
        meta: result.meta
    });
}));
const getSinglePStock = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    console.log("id", id);
    const productfound = yield pricestock_model_1.PriceStockModel.findById(id);
    console.log("productfound", productfound);
    const result = yield pstocke_service_1.pstockService.getSinglePStock(id);
    // if (!result) {
    //     throw new AppError(httpStatus.NOT_FOUND, "Product not found");
    // }
    console.log();
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 200,
        message: "Product details fetched successfully",
        success: true,
        data: result
    });
}));
exports.PstokesController = {
    getAllPstokes, getSinglePStock
};
