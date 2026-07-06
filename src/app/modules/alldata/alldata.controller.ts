import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendresponse';
import AppError from '../../errorHelper/AppError';
import { deleteImageForCloudinary } from '../../config/cloudinary.config';
import { alldataService } from './alldata.service';

const getAllProducts = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const query = req.query;
  const result = await alldataService.getAllProducts(query as Record<string, string>);

  sendResponse(res, {
    statusCode: 200,
    message: 'Products fetched successfully',
    success: true,
    data: result.data,
    meta: result.meta,
  });
});

const getSingleProduct = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { id } = req.params;
  const result = await alldataService.getSingleProduct(id);

  sendResponse(res, {
    statusCode: 200,
    message: 'Product details fetched successfully',
    success: true,
    data: result,
  });
});

const createProduct = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  let parsedData;
  try {
    parsedData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
  } catch (error) {
    throw new AppError(400, 'Invalid JSON data format');
  }

  // image upload optional here — payload may already carry mainImage/images
  // from the frontend if you're not using multer for this route
  const finalPayload = req.file?.path
    ? { ...parsedData, mainImage: req.file.path }
    : parsedData;

  const product = await alldataService.createProduct(finalPayload);

  if (!product) {
    if (req.file?.path) await deleteImageForCloudinary(req.file.path);
    throw new AppError(500, 'Failed to create product in database');
  }

  sendResponse(res, {
    statusCode: 201,
    message: 'Product created successfully',
    success: true,
    data: product,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { id } = req.params;

  let parsedData;
  try {
    parsedData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
  } catch (error) {
    throw new AppError(400, 'Invalid JSON data format');
  }

  const finalPayload = req.file?.path
    ? { ...parsedData, mainImage: req.file.path }
    : parsedData;

  const product = await alldataService.updateProduct(id, finalPayload);

  sendResponse(res, {
    statusCode: 200,
    message: 'Product updated successfully',
    success: true,
    data: product,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { id } = req.params;
  const product = await alldataService.deleteProduct(id);

  sendResponse(res, {
    statusCode: 200,
    message: 'Product deleted successfully',
    success: true,
    data: product,
  });
});

const getAdminOverview = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
  const result = await alldataService.getAdminOverview();

  sendResponse(res, {
    statusCode: 200,
    message: 'Admin overview fetched successfully',
    success: true,
    data: result,
  });
});

const getCategories = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
  const result = await alldataService.getCategories();

  sendResponse(res, {
    statusCode: 200,
    message: 'Categories fetched successfully',
    success: true,
    data: result,
  });
});

export const AlldataController = {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOverview,
  getCategories,

};