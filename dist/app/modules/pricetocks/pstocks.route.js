"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceStocks = void 0;
const express_1 = require("express");
const pstoks_controller_1 = require("./pstoks.controller");
const router = (0, express_1.Router)();
router.get("/", pstoks_controller_1.PstokesController.getAllPstokes);
router.get("/:id", pstoks_controller_1.PstokesController.getSinglePStock);
exports.PriceStocks = router;
