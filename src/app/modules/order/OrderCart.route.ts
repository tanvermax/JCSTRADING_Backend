// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Router } from 'express';
import { OrderController } from './Order.controller';
import { cheakAuth } from '../../middleware/cheakAuth';
import { Role } from '../user/user.interface';



const router = Router();


router.get("/",cheakAuth(...Object.values(Role)), OrderController.getAllOrder)


export const OrderRoute = router