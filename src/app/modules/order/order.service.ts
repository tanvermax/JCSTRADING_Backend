import { OrderModel } from "./order.model";

const getAllOrder = async (query: Record<string, string>,userId:string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter:Record<string, any> = { ...query };
    if (userId) {
        filter.userId = userId;
    }
    // console.log("filter",filter)
    const product = await OrderModel.find(filter).populate('orderedItems.product');
    // console.log(product)
    const totalProduct = await OrderModel.countDocuments();

    return {
        data: product,
        meta: {
            total: totalProduct
        }
    } 
}


export const OrderService = {
 getAllOrder
}