// src/types/product.ts
import httpStatus from 'http-status-codes';

import AppError from "../../errorHelper/AppError";
import { IProduct } from "./product.interface";
import { Product } from "./product.model";
import { deleteImageForCloudinary } from '../../config/cloudinary.config';
import { OrderModel } from '../order/order.model';
import { PriceStockModel } from '../pricetocks/pricestock.model';
import { AlldataModel } from '../alldata/alldata.model';




const createProduct = async (payload: IProduct) => {
    const ISProductExit = await PriceStockModel.findOne({ title: payload.title });
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
    // console.log(payload)
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
        // console.log(dupliocateProduct)
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
    // console.log(id)

    const product = await Product.findById({ _id: id.trim() });
    return {
        data: product
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any

const addToCartIntoDB = async (payload: { productId: string; quantity: number }, userId: string) => {
    const { productId, quantity } = payload;

    // console.log("Processing Cart Input -> Product ID:", productId, "Quantity:", quantity, "User:", userId);

    // ১. PriceStockModel এর বদলে AlldataModel দিয়ে সরাসরি স্ট্রিং _id খুঁজুন
    // যেহেতু আপনার নতুন স্কিমায় _id নিজেই একটি কাস্টম স্ট্রিং, তাই এটি কাস্টম আইডি দিয়ে সরাসরি খুঁজবে
    const product = await AlldataModel.findById(productId);
    // console.log(product);

    if (!product) {
        throw new Error('Product not found in database with the given Daraz ID');
    }

    // ২. স্টকের হিসাব এবং দাম নির্ধারণ করা
    // আপনার নতুন স্কিমা অনুযায়ী মেইন অবজেক্টে totalStock এবং minPrice অথবা বিশেষ দাম আছে।
    const availableQuantity = product.totalStock ?? 0;
    const itemPrice = product.specialPrice || product.minPrice; // ডিসকাউন্ট প্রাইস থাকলে সেটা নিবে, নয়তো মিনিমাম প্রাইস

    if (availableQuantity < quantity) {
        throw new Error('Insufficient stock available');
    }

    if (!itemPrice) {
        throw new Error('Product price is missing or invalid in database');
    }

    // ৩. ইউজারের কোনো "Pending" অর্ডার/কার্ট অলরেডি তৈরি করা আছে কিনা দেখা
    const cart = await OrderModel.findOne({ userId, status: 'Pending' });

    if (!cart) {
        // ৪. কার্ট না থাকলে একদম নতুন কার্ট তৈরি করা হচ্ছে
        return await OrderModel.create({
            userId: userId,
            orderedItems: [{ 
                product: productId, // এটি এখন স্ট্রিং আইডি হিসেবে অর্ডার মডেলে সেভ হবে
                quantity, 
                price: itemPrice
            }],
            totalPrice: itemPrice * quantity,
            status: 'Pending',
        });
    }

    // ৫. কার্ট আগে থেকে থাকলে চেক করা হচ্ছে এই প্রোডাক্ট অলরেডি কার্টে আছে কিনা
    const itemIndex = cart.orderedItems.findIndex(
        item => item.product.toString() === productId.toString()
    );

    if (itemIndex > -1) {
        // প্রোডাক্ট ইতিমধ্যে কার্টে থাকলে শুধু কোয়ান্টিটি বাড়িয়ে দেওয়া হচ্ছে
        cart.orderedItems[itemIndex].quantity += quantity;
    } else {
        // নতুন প্রোডাক্ট হলে পুশ করা হচ্ছে
        cart.orderedItems.push({ 
            product: productId, 
            quantity, 
            price: itemPrice 
        });
    }

    // ৬. কার্টের টোটাল প্রাইস আবার হিসাব করা
    cart.totalPrice = cart.orderedItems.reduce(
        (total, item) => total + (item.price * item.quantity), 0
    );

    return await cart.save();
};


export const productService = {
    createProduct, deleteProduct, addToCartIntoDB, getAllProduct, updateproduct, getproductDetails
}