const SubCategory = require("../models/product/subcategory.model");
const Product = require("../models/product/product.model");
const { catchAsync } = require("../utils/catchAsync.util");
const AppError = require("../utils/appError.util");

const getAllSubCategories = catchAsync(async (req, res, next) => {
    const subCategories = await SubCategory
        .find({ isDeleted: false })
        .populate("category", "name");
    res.status(200).json({
        message: "SubCategories retrieved successfully",
        data: subCategories
    });
});

const getSubCategoryById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const subCategory = await SubCategory.findOne({ _id: id, isDeleted: false }).populate("category", "name");
    if (!subCategory) {
        return next(new AppError("SubCategory not found", 404));
    }
    res.status(200).json({
        message: "SubCategory retrieved successfully",
        data: subCategory
    });
});

const createSubCategory = catchAsync(async (req, res, next) => {
    const { name, slug, category } = req.body;
    const targetSlug = slug
        ? slug.toLowerCase().trim().replace(/\s+/g, "-")
        : (name ? name.toLowerCase().trim().replace(/\s+/g, "-") : undefined);
    const subCategory = await SubCategory.create({
        name,
        slug: targetSlug,
        category
    });
    res.status(201).json({
        message: "SubCategory created successfully",
        data: subCategory
    });
});

const updateSubCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, slug, category } = req.body;
    const data = {};

    if (name) data.name = name;
    if (slug) data.slug = slug.toLowerCase().trim().replace(/\s+/g, "-");
    if (category) data.category = category;
    const subCategory = await SubCategory.findOneAndUpdate(
        { _id: id, isDeleted: false },
        data,
        { new: true, runValidators: true }
    );
    if (!subCategory) {
        return next(new AppError("SubCategory not found", 404));
    }
    res.status(200).json({
        message: "SubCategory updated successfully",
        data: subCategory
    });
});

const deleteSubCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const subCategory = await SubCategory.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
    );
    if (!subCategory) {
        return next(new AppError("SubCategory not found", 404));
    }
    await Product.updateMany(
        { subCategory: id, isDeleted: false },
        { isDeleted: true }
    );
    res.status(200).json({
        message: "SubCategory and its related products were deleted successfully"
    });
});

module.exports = {
    getAllSubCategories,
    getSubCategoryById,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory
};