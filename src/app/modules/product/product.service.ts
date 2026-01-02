// src/types/product.ts
import httpStatus from 'http-status-codes';

import AppError from "../../errorHelper/AppError";
import { IProduct } from "./product.interface";
import { Product } from "./product.model";
import { deleteImageForCloudinary } from '../../config/cloudinary.config';
import { OrderModel } from '../order/order.model';
import { Types } from 'mongoose';



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
    console.log(filter)
    const product = await Product.find(filter);

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
    const product = await Product.findById(id);
    console.log("product",product)
    return {
        data: product
    };
}

const createOrderIntoDB = async (payload: { productId: string; quantity: number}) => {

const { productId, quantity } = payload;

  // 1. Find the product

  console.log("product",productId)
  console.log("quantity",quantity)
  
  const product = await Product.findById(new Types.ObjectId(productId));

  if (!product) {
    throw new Error('Product not found');
  }
  if (!product.stock) {
    throw new Error('stock not found');
  }
  if (!product.price) {
    throw new Error('price not found');
  }

  // 2. Check if enough stock exists
  if (product.stock < quantity) {
    throw new Error('Insufficient stock! Only ' + product.stock + ' items left.');
  }

 // 3. Calculate total (Price from DB * quantity from Frontend)
  const totalPrice = product.price * quantity;

  // 4. Create the Order record
  const result = await OrderModel.create({
    product: productId,
    quantity,
    totalPrice,
    status: 'Pending',
  });

  // 5. Update the Product stock
  await Product.findByIdAndUpdate(productId, {
    $inc: { stock: -quantity },
  });

  return result;
};



export const productService = {
    createProduct, deleteProduct, createOrderIntoDB, getAllProduct, updateproduct, getproductDetails
}