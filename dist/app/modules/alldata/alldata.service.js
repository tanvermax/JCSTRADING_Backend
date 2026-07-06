"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alldataService = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelper/AppError"));
const alldata_model_1 = require("./alldata.model");
const MAX_LIMIT = 50;
const getAllProducts = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { page: queryPage, limit: queryLimit, search, category, inStock, minPrice, maxPrice } = query;
    const page = Number(queryPage) || 1;
    const limit = Math.min(Number(queryLimit) || 20, MAX_LIMIT);
    const skip = (page - 1) * limit;
    const filter = { status: 'active' };
    if (category)
        filter.category = category;
    if (inStock === 'true')
        filter.inStock = true;
    if (search)
        filter.$text = { $search: search };
    if (minPrice || maxPrice) {
        filter.minPrice = {};
        if (minPrice)
            filter.minPrice.$gte = Number(minPrice);
        if (maxPrice)
            filter.minPrice.$lte = Number(maxPrice);
    }
    // Card/listing view — only the fields a product card actually needs.
    // No $lookup, no $unionWith: everything already lives on this one document.
    const cardProjection = {
        name: 1,
        mainImage: 1,
        minPrice: 1,
        maxPrice: 1,
        specialPrice: 1,
        hasDiscount: 1,
        inStock: 1,
        category: 1,
        slug: 1,
    };
    const [data, total] = yield Promise.all([
        alldata_model_1.AlldataModel.find(filter, cardProjection)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        alldata_model_1.AlldataModel.countDocuments(filter),
    ]);
    return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
});
const getSingleProduct = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const cleanId = id.startsWith(':') ? id.substring(1) : id;
    // Full document — detail page needs variants, specs, description etc.
    const product = yield alldata_model_1.AlldataModel.findById(cleanId).lean();
    if (!product) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Product not found');
    }
    return product;
});
const createProduct = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield alldata_model_1.AlldataModel.findById(payload._id);
    if (exists) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Product already exists');
    }
    const baseSlug = payload.name
        ? payload.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
        : String(payload._id);
    const slug = `${baseSlug}-${payload._id}`;
    // derive precomputed fields the same way the migration script does,
    // so manually-created products stay consistent with imported ones
    const activeVariants = (payload.variants || []).filter(v => v.status === 'active');
    const prices = activeVariants.map(v => v.price).filter(p => p != null);
    const specialPrices = activeVariants.map(v => v.specialPrice).filter((p) => p != null);
    const totalStock = (payload.variants || []).reduce((sum, v) => sum + (v.quantity || 0), 0);
    const productData = Object.assign(Object.assign({}, payload), { slug, minPrice: prices.length ? Math.min(...prices) : undefined, maxPrice: prices.length ? Math.max(...prices) : undefined, specialPrice: specialPrices.length ? Math.min(...specialPrices) : undefined, hasDiscount: specialPrices.length > 0, totalStock, inStock: totalStock > 0, variantCount: (payload.variants || []).length, status: activeVariants.length > 0 ? 'active' : 'inactive' });
    return alldata_model_1.AlldataModel.create(productData);
});
const updateProduct = (id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const cleanId = id.startsWith(':') ? id.substring(1) : id;
    // If variants were touched, recompute the denormalized fields so the
    // card view never goes stale relative to the underlying variant data.
    if (updateData.variants) {
        const activeVariants = updateData.variants.filter(v => v.status === 'active');
        const prices = activeVariants.map(v => v.price).filter(p => p != null);
        const specialPrices = activeVariants.map(v => v.specialPrice).filter((p) => p != null);
        const totalStock = updateData.variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
        updateData.minPrice = prices.length ? Math.min(...prices) : undefined;
        updateData.maxPrice = prices.length ? Math.max(...prices) : undefined;
        updateData.specialPrice = specialPrices.length ? Math.min(...specialPrices) : undefined;
        updateData.hasDiscount = specialPrices.length > 0;
        updateData.totalStock = totalStock;
        updateData.inStock = totalStock > 0;
        updateData.variantCount = updateData.variants.length;
        updateData.status = activeVariants.length > 0 ? 'active' : 'inactive';
    }
    const updated = yield alldata_model_1.AlldataModel.findByIdAndUpdate(cleanId, updateData, {
        new: true,
        runValidators: true,
    });
    if (!updated) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Product not found');
    }
    return updated;
});
const deleteProduct = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const cleanId = id.startsWith(':') ? id.substring(1) : id;
    const deleted = yield alldata_model_1.AlldataModel.findByIdAndDelete(cleanId);
    if (!deleted) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Product not found');
    }
    return deleted;
});
// ---- ADMIN / DASHBOARD STATS ----
const getAdminOverview = () => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield alldata_model_1.AlldataModel.aggregate([
        {
            $facet: {
                overview: [
                    {
                        $group: {
                            _id: null,
                            totalProducts: { $sum: 1 },
                            totalActive: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                            totalInactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
                            totalInStock: { $sum: { $cond: ['$inStock', 1, 0] } },
                            totalOutOfStock: { $sum: { $cond: ['$inStock', 0, 1] } },
                            totalStockQuantity: { $sum: '$totalStock' },
                            totalVariants: { $sum: '$variantCount' },
                            totalWithDiscount: { $sum: { $cond: ['$hasDiscount', 1, 0] } },
                            avgMinPrice: { $avg: '$minPrice' },
                            avgMaxPrice: { $avg: '$maxPrice' },
                        },
                    },
                ],
                byCategory: [
                    {
                        $group: {
                            _id: { $ifNull: ['$catId', 'uncategorized'] },
                            productCount: { $sum: 1 },
                            totalStock: { $sum: '$totalStock' },
                            inStockCount: { $sum: { $cond: ['$inStock', 1, 0] } },
                            outOfStockCount: { $sum: { $cond: ['$inStock', 0, 1] } },
                            avgPrice: { $avg: '$minPrice' },
                        },
                    },
                    { $sort: { productCount: -1 } },
                ],
                lowStock: [
                    { $match: { inStock: true, totalStock: { $lte: 5 } } },
                    { $project: { name: 1, mainImage: 1, totalStock: 1, minPrice: 1, catId: 1 } },
                    { $sort: { totalStock: 1 } },
                    { $limit: 20 },
                ],
                outOfStock: [
                    { $match: { inStock: false } },
                    { $project: { name: 1, mainImage: 1, catId: 1, updatedAt: 1 } },
                    { $sort: { updatedAt: -1 } },
                    { $limit: 20 },
                ],
                recentlyUpdated: [
                    { $sort: { updatedAt: -1 } },
                    { $limit: 10 },
                    { $project: { name: 1, mainImage: 1, updatedAt: 1, status: 1, inStock: 1 } },
                ],
            },
        },
    ]);
    return {
        overview: result.overview[0] || {
            totalProducts: 0,
            totalActive: 0,
            totalInactive: 0,
            totalInStock: 0,
            totalOutOfStock: 0,
            totalStockQuantity: 0,
            totalVariants: 0,
            totalWithDiscount: 0,
            avgMinPrice: 0,
            avgMaxPrice: 0,
        },
        categories: result.byCategory,
        lowStock: result.lowStock,
        outOfStock: result.outOfStock,
        recentlyUpdated: result.recentlyUpdated,
    };
});
const getCategories = () => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield alldata_model_1.AlldataModel.aggregate([
        {
            $group: {
                _id: { $ifNull: ['$catId', 'uncategorized'] },
                productCount: { $sum: 1 },
            },
        },
        { $sort: { productCount: -1 } },
        { $project: { _id: 0, catId: '$_id', productCount: 1 } },
    ]);
    return categories;
});
exports.alldataService = {
    getAllProducts,
    getSingleProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getAdminOverview,
    getCategories,
};
