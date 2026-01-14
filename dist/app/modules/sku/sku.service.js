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
exports.SkuService = void 0;
const sku_model_1 = require("./sku.model");
const getAllSku = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = query;
    console.log("getAllSku", filter);
    const mapped = yield sku_model_1.Skuming.find({});
    const totalProduct = yield sku_model_1.Skuming.countDocuments();
    return {
        data: mapped,
        meta: {
            total: totalProduct
        }
    };
});
exports.SkuService = {
    getAllSku
};
