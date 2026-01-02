// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { multerUpload } from './../../config/multer.config';
import { Router } from "express";
import { ProductController } from "./product.controller";
import { validateRequest } from '../../middleware/validationRequest';
import { CreateProductZodSchema } from './product.validation';
import { cheakAuth } from '../../middleware/cheakAuth';
import { Role } from '../user/user.interface';


const router = Router();


router.post("/create-product",multerUpload.single("file"),validateRequest(CreateProductZodSchema), ProductController.creatProduct);
router.get("/:id",ProductController.getproductdetails)

router.get("/", ProductController.getAllProduct);
router.patch('/:id', multerUpload.single("file"), ProductController.updateProduct)
router.delete("/:id", cheakAuth(Role.ADMIN), ProductController.deleteProduct);

router.post("/order",ProductController.order)

export const ProductRoute = router