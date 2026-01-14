"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRoute = void 0;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const multer_config_1 = require("./../../config/multer.config");
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const validationRequest_1 = require("../../middleware/validationRequest");
const product_validation_1 = require("./product.validation");
const cheakAuth_1 = require("../../middleware/cheakAuth");
const user_interface_1 = require("../user/user.interface");
const router = (0, express_1.Router)();
router.post("/create-product", multer_config_1.multerUpload.single("file"), (0, validationRequest_1.validateRequest)(product_validation_1.CreateProductZodSchema), product_controller_1.ProductController.creatProduct);
router.get("/:id", product_controller_1.ProductController.getproductdetails);
router.get("/", product_controller_1.ProductController.getAllProduct);
router.patch('/:id', multer_config_1.multerUpload.single("file"), product_controller_1.ProductController.updateProduct);
router.delete("/:id", (0, cheakAuth_1.cheakAuth)(user_interface_1.Role.ADMIN), product_controller_1.ProductController.deleteProduct);
router.post("/order", (0, cheakAuth_1.cheakAuth)(...Object.values(user_interface_1.Role)), product_controller_1.ProductController.order);
exports.ProductRoute = router;
