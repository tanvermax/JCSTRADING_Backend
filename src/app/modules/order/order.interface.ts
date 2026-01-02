import { Types } from 'mongoose';

export type TOrderStatus = 'Pending' | 'Paid' | 'Shipped' | 'Completed' | 'Cancelled';
export type TPaymentStatus = 'Pending' | 'Success' | 'Failed';

export interface TOrderItem {
    email: string; // Identify the buyer
    product: Types.ObjectId;
    quantity: number;
    price: number;
    totalPrice: number;
    status: 'Pending' | 'Paid' | 'Cancelled';
}

export interface TOrder {
    user: Types.ObjectId;
    orderedItems: TOrderItem[];
    totalPrice: number;
    status: TOrderStatus;
    paymentStatus: TPaymentStatus;
    transactionId?: string;
    shippingAddress: {
        city: string;
        address: string;
        phone: string;
    };
}