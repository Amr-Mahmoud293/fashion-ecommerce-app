const Category = require("../models/product/category.model");
const SubCategory = require("../models/product/subcategory.model")
const Product = require("../models/product/product.model")
const { catchAsync } = require("../utils/catchAsync.util");
const AppError = require("../utils/appError.util");

const getAllCategories = catchAsync(async (req, res, next) => {
    const categories = await Category.find({ isDeleted: false });
    res.status(200).json({
        message: "Categories retrieved successfully",
        data: categories
    });
});

const getCategoryById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const category = await Category.findOne({ _id: id, isDeleted: false });
    if (!category) {
        return next(new AppError("Category not found", 404));
    }
    res.status(200).json({
        message: "Category retrieved successfully",
        data: category
    });
});

const createCategory = catchAsync(async (req, res, next) => {
    const { name, slug } = req.body;
    const targetSlug = slug
        ? slug.toLowerCase().trim().replace(/\s+/g, "-")
        : (name ? name.toLowerCase().trim().replace(/\s+/g, "-") : undefined);
    const category = await Category.create({ name, slug: targetSlug });
    res.status(201).json({
        message: "Category created successfully",
        data: category
    });
});

const updateCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, slug } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug.toLowerCase().trim().replace(/\s+/g, "-");
    const category = await Category.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true, runValidators: true }
    );
    if (!category) {
        return next(new AppError("Category not found", 404));
    }
    res.status(200).json({
        message: "Category updated successfully",
        data: category
    });
});

const deleteCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const category = await Category.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
    );
    if (!category) {
        return next(new AppError("Category not found", 404));
    }
    await Promise.all([
        SubCategory.updateMany(
            { category: id, isDeleted: false },
            { isDeleted: true }
        ),
        Product.updateMany(
            { category: id, isDeleted: false },
            { isDeleted: true }
        )
    ]);
    res.status(200).json({
        message: "Category and its related subcategories and products were deleted successfully"
    });
});

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
