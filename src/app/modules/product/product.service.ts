// src/types/product.ts
import httpStatus from 'http-status-codes';

import AppError from "../../errorHelper/AppError";
import { IProduct } from "./product.interface";
import { Product } from "./product.model";
import { deleteImageForCloudinary } from '../../config/cloudinary.config';


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




export const productService = {
    createProduct, deleteProduct, getAllProduct, updateproduct
}