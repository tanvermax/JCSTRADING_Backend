"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkuRouter = void 0;
const express_1 = require("express");
const sku_controller_1 = require("./sku.controller");
const router = (0, express_1.Router)();
router.get("/", sku_controller_1.SkuController.getAllSku);
exports.SkuRouter = router;
