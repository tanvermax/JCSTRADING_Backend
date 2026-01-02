/* eslint-disable @typescript-eslint/no-unused-expressions */
import {Router } from "express";
import { userController } from "./user.controller";
import { cheakAuth } from "../../middleware/cheakAuth";
import { Role } from "./user.interface";
// import { createUserZodSchema } from "./user.validation";
// import { validateRequest } from "../../middleware/validationRequest";
// import { cheakAuth} from "../../middleware/cheakAuth";
// import { Role } from "./user.interface";
// import { transactionController } from "../transaction/transaction.controller";

const router = Router();





router.post("/register",
    //  validateRequest(createUserZodSchema)
 userController.createUser);
router.get("/me", cheakAuth(...Object.values(Role)), userController.getMe)


export const UserRoutes = router;
