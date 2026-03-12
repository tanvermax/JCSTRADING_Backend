import { Router } from "express";
import { PstokesController } from "./pstoks.controller";
import { multerUpload } from "../../config/multer.config";




const router = Router();

router.get("/", PstokesController.getAllPstokes);
router.get("/:id", PstokesController.getSinglePStock);
router.post("/create-product",multerUpload.single("file"), PstokesController.creatPricestok);


export const PriceStocks = router