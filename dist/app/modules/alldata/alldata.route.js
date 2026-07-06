"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlldataRoute = void 0;
const express_1 = require("express");
const multer_config_1 = require("../../config/multer.config");
const alldata_controller_1 = require("./alldata.controller");
const router = (0, express_1.Router)();
router.get('/', alldata_controller_1.AlldataController.getAllProducts);
// ⚠️ these must come BEFORE '/:id' or express will treat "admin"/"categories" as an id
router.get('/admin/overview', alldata_controller_1.AlldataController.getAdminOverview);
router.get('/categories', alldata_controller_1.AlldataController.getCategories);
router.get('/:id', alldata_controller_1.AlldataController.getSingleProduct);
router.post('/create-product', multer_config_1.multerUpload.single('file'), alldata_controller_1.AlldataController.createProduct);
router.patch('/:id', multer_config_1.multerUpload.single('file'), alldata_controller_1.AlldataController.updateProduct);
router.delete('/:id', alldata_controller_1.AlldataController.deleteProduct);
exports.AlldataRoute = router;
