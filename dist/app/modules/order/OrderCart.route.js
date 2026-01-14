"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRoute = void 0;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const express_1 = require("express");
const Order_controller_1 = require("./Order.controller");
const cheakAuth_1 = require("../../middleware/cheakAuth");
const user_interface_1 = require("../user/user.interface");
const router = (0, express_1.Router)();
router.get("/", (0, cheakAuth_1.cheakAuth)(...Object.values(user_interface_1.Role)), Order_controller_1.OrderController.getAllOrder);
router.patch("/:id", (0, cheakAuth_1.cheakAuth)(...Object.values(user_interface_1.Role)), Order_controller_1.OrderController.updateOrderStatus);
router.patch("/orderconfirm/:id", (0, cheakAuth_1.cheakAuth)(...Object.values(user_interface_1.Role)), Order_controller_1.OrderController.confirmOrder);
exports.OrderRoute = router;
