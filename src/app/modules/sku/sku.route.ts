import { Router } from "express";
import { SkuController } from "./sku.controller";


const router = Router();


router.get("/", SkuController.getAllSku);


export const SkuRouter = router