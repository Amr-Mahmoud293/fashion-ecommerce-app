const fs = require("fs");
const path = require("path");
const Product = require("../models/product/product.model");
const { catchAsync } = require("../utils/catchAsync.util");
const AppError = require("../utils/appError.util");

const removeUploadedFile = (filename) => {
    if (!filename) return;
    const filePath = path.join(__dirname, "../uploads", filename);
    fs.unlink(filePath, (err) => {
        if (err && err.code !== "ENOENT") {
            console.error(`Failed to delete file: ${filename}`, err);
        }
    });
};

const getAllProducts = (req, res, next) => {
    res.status(200).json({
        message: "Products retrieved successfully",
        ...res.paginationResult
    });
};

const getProductById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findOne({ _id: id, isDeleted: false })
        .populate("category", "name")
        .populate("subCategory", "name");
    if (!product) {
        return next(new AppError("Product not found", 404));
    }
    res.status(200).json({
        message: "Product retrieved successfully",
        data: product
    });
});

const createProduct = catchAsync(async (req, res, next) => {
    const {
        name,
        description,
        slug,
        price,
        category,
        subCategory,
        stock,
        isTop,
        isNewArrival,
        isActive
    } = req.body;
    const imageURL = req.file?.filename;
    const targetSlug = slug
        ? slug.toLowerCase().trim().replace(/\s+/g, "-")
        : (name ? name.toLowerCase().trim().replace(/\s+/g, "-") : undefined);
    try {
        const product = await Product.create({
            name,
            description,
            slug: targetSlug,
            price,
            imageURL,
            category,
            subCategory,
            stock,
            isTop,
            isNewArrival,
            isActive
        });
        res.status(201).json({
            message: "Product created successfully",
            data: product
        });
    } catch (error) {
        if (req.file) {
            removeUploadedFile(req.file.filename);
        }
        return next(error);
    }
});

const updateProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const allowedFields = [
        'name',
        'description',
        'price',
        'category',
        'subCategory',
        'stock',
        'isTop',
        'isNewArrival',
        'isActive'
    ];
    const updateData = {};
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    });
    if (req.body.slug) {
        updateData.slug = req.body.slug.toLowerCase().trim().replace(/\s+/g, "-");
    }
    if (req.file) {
        updateData.imageURL = req.file.filename;
    }
    try {
        const product = await Product.findOne({ _id: id, isDeleted: false });
        if (!product) {
            if (req.file) removeUploadedFile(req.file.filename);
            return next(new AppError("Product not found", 404));
        }
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: id, isDeleted: false },
            updateData,
            { new: true, runValidators: true }
        );
        if (req.file && product.imageURL) {
            removeUploadedFile(product.imageURL);
        }
        res.status(200).json({
            message: "Product updated successfully",
            data: updatedProduct
        });
    } catch (error) {
        if (req.file) {
            removeUploadedFile(req.file.filename);
        }
        return next(error);
    }
});

const deleteProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true }
    );
    if (!product) {
        return next(new AppError("Product not found", 404));
    }
    res.status(200).json({
        message: "Product deleted successfully"
    });
});

const relatedProducts = catchAsync(async (req, res, next) => {
    const currentProduct = await Product.findOne({ _id: req.params.id, isDeleted: false });
    if (!currentProduct) {
        return next(new AppError("Product not found", 404));
    }
    const related = await Product.find({
        subCategory: currentProduct.subCategory,
        _id: { $ne: req.params.id },
        isDeleted: false
    }).limit(5).populate("category", "name").populate("subCategory", "name");
    res.status(200).json({
        message: "Related products retrieved successfully",
        data: related
    });
});

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    relatedProducts
};