import { Types } from 'mongoose';

export type TOrderStatus = 'Pending' | 'Paid' | 'Shipped' | 'Completed' | 'Cancelled';
export type TPaymentStatus = 'Pending' | 'Success' | 'Failed';

export interface TOrderItem {
    _id?:Types.ObjectId | string;
    product: Types.ObjectId | string;
    quantity: number;
    price: number;
}

export interface TOrder {
   userId?: string; // Optional for Guest Checkout
    email: string;   
    grandTotal?:number     // Moved from TOrderItem to here
    orderedItems: TOrderItem[];
    totalPrice: number;
    status: TOrderStatus;
    paymentStatus: TPaymentStatus;
    transactionId?: string;
    shippingAddress: {
        name:string
        address: string;
        phone: number;
        shippingArea:string
    };
}