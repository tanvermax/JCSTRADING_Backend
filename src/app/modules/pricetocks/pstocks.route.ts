import { Router } from "express";
import { PstokesController } from "./pstoks.controller";


const router = Router();

router.get("/", PstokesController.getAllPstokes);


export const PriceStocks = router