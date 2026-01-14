import { Schema, model } from 'mongoose';
import { TOrder } from './order.interface';


const orderSchema = new Schema<TOrder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', },
  orderedItems: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Shipped', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Success', 'Failed'],
    default: 'Pending'
  },
  grandTotal: { type: Number },
  transactionId: { type: String },
  shippingAddress: {
    name: { type: String },
    phone: { type: Number },
    address: { type: String },
    shippingArea: {
      type: String,
      enum: ['inside', 'outside']
    }
  }
}, {
  timestamps: true
});

export const OrderModel = model<TOrder>('Order', orderSchema);