// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Router } from 'express';
import { OrderController } from './Order.controller';
import { cheakAuth } from '../../middleware/cheakAuth';
import { Role } from '../user/user.interface';



const router = Router();


router.get("/",cheakAuth(...Object.values(Role)), OrderController.getAllOrder)
router.patch("/:id",cheakAuth(...Object.values(Role)),OrderController.updateOrderStatus)
router.patch("/orderconfirm/:id",cheakAuth(...Object.values(Role)),OrderController.confirmOrder)
router.patch("/orderconfirmnonuser/:id", OrderController.confirmOrdernonloguser)
router.delete("/:id",cheakAuth(...Object.values(Role)), OrderController.deleteOrder)

export const OrderRoute = router