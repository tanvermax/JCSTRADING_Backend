// src/types/product.ts
import httpStatus from 'http-status-codes';

import AppError from "../../errorHelper/AppError";
import { IProduct } from "./product.interface";
import { Product } from "./product.model";
import { deleteImageForCloudinary } from '../../config/cloudinary.config';
import { OrderModel } from '../order/order.model';
import { PriceStockModel } from '../pricetocks/pricestock.model';




const createProduct = async (payload: IProduct) => {
    const ISProductExit = await Product.findOne({ title: payload.title });
    console.log(ISProductExit)
    if (ISProductExit) {
        throw new AppError(httpStatus.BAD_REQUEST, "Product alredy exit in")
    }


    const baseSlug = payload.title.toLocaleLowerCase().split(" ").join("-");
    let counter = 0;
    let slug = `${baseSlug}-product`;
    while (await Product.exists({ slug })) {
        slug = `${slug}-${counter++}`
    }
    payload.slug = slug
    console.log(payload)
    const product = Product.create(payload)
    return product
}

const getAllProduct = async (query: Record<string, string>) => {
    const filter = query
    // console.log("filter",filter)
    const product = await Product.find(filter);
    // console.log(product)
    const totalProduct = await Product.countDocuments();

    return {
        data: product,
        meta: {
            total: totalProduct
        }
    }
}

const updateproduct = async (id: string, payload: Partial<IProduct>) => {

    const ifProduct = await Product.findById(id);

    if (!ifProduct) {
        throw new AppError(httpStatus.FORBIDDEN, "Product not found")

    }
    const dupliocateProduct = await Product.findOne({
        title: payload.title,
        _id: { $ne: id }
    })
    if (dupliocateProduct) {
        console.log(dupliocateProduct)
        throw new Error("Product already exits")
    }
    if (payload.title) {
        // const { title, slug, description, thumbnile } = paylod;
        const baseSlug = payload.title.toLocaleLowerCase().split(" ").join("-");
        let counter = 0;
        let slug = `${baseSlug}-product`;
        while (await Product.exists({ slug })) {

            slug = `${slug}-${counter++}`
        }
        payload.slug = slug
    }
    const newProduct = await Product.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
    if (payload.images && ifProduct.images) {
        await deleteImageForCloudinary(ifProduct.images)
    }
    return newProduct

}

const deleteProduct = async (id: string) => {
    await Product.findByIdAndDelete(id);
    return null;
}

const getproductDetails = async (id: string) => {
    console.log(id)

    const product = await Product.findById({ _id: id.trim() });
    return {
        data: product
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addToCartIntoDB = async (payload: { productId: string; quantity: number }, userId: string) => {
    const { productId, quantity, } = payload;

    console.log("productId, quantity, userId", productId, quantity, userId)

// 1. Fetch product - Ensure productId is a valid Hex string
    const product = await PriceStockModel.findById(productId);

    if (!product) {
        throw new Error('Product not found in database');
    }

    // 2. Use the EXACT keys from your JSON (with the asterisks)
    const availableQuantity = product["*Quantity"] || 0;
    const itemPrice = product["SpecialPrice"] || product["*Price"];

    // 1. Find if the user already has a "Pending" order (their Cart)
    // eslint-disable-next-line prefer-const
   if (availableQuantity < quantity) {
        throw new Error('Insufficient stock available');
    }

    if (!itemPrice) {
        throw new Error('Product price is missing or invalid');
    }

    // 3. Find existing "Pending" order
    const cart = await OrderModel.findOne({ userId, status: 'Pending' });

    if (!cart) {
        // 2. No cart? Create one with this item
        return await OrderModel.create({
            userId: userId,
            orderedItems: [{ 
                product: productId, 
                quantity, 
                price: itemPrice // Use the correct price variable
            }],
            totalPrice: itemPrice * quantity,
            status: 'Pending',
        });
    }

    // 3. Cart exists? Check if product is already in the array
    const itemIndex = cart.orderedItems.findIndex(
        item => item.product.toString() === productId
    );

   if (itemIndex > -1) {
        cart.orderedItems[itemIndex].quantity += quantity;
    } else {
        cart.orderedItems.push({ 
            product: productId, 
            quantity, 
            price: itemPrice 
        });
    }

    // 4. Recalculate Total
    cart.totalPrice = cart.orderedItems.reduce(
        (total, item) => total + (item.price * item.quantity), 0
    );

    return await cart.save();
};


export const productService = {
    createProduct, deleteProduct, addToCartIntoDB, getAllProduct, updateproduct, getproductDetails
}