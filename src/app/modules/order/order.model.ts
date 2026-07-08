import { Schema, model } from 'mongoose';
import { TOrder } from './order.interface';


const orderSchema = new Schema<TOrder>({
  userId: { type: Schema.Types.ObjectId || String, ref: 'User', },
  orderedItems: [
    {
      _id:false,
      product: { type: String, ref: 'Alldata', required: true },
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
  trackingId:{type:String},
  courierName:{type:String},
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

orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 }); // কারণ আপনি রেডিমেড সর্ট করছেন -1 দিয়ে

export const OrderModel = model<TOrder>('Order', orderSchema);