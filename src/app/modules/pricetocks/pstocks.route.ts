import { Router } from "express";
import { PstokesController } from "./pstoks.controller";


const router = Router();

router.get("/", PstokesController.getAllPstokes);
router.get("/:id", PstokesController.getSinglePStock);


export const PriceStocks = router