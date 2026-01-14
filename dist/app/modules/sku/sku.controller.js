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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkuController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendresponse_1 = require("../../utils/sendresponse");
const sku_service_1 = require("./sku.service");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAllSku = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    console.log("query getAllSku from controller", query);
    const result = yield sku_service_1.SkuService.getAllSku(query);
    (0, sendresponse_1.sendResponse)(res, {
        statusCode: 200,
        message: "all sku retrive  successfully",
        success: true,
        data: result.data,
        meta: result.meta
    });
}));
exports.SkuController = {
    getAllSku
};
