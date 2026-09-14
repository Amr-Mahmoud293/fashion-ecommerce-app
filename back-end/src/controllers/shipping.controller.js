const Shipping = require("../models/shipping.model");
const { catchAsync } = require("../utils/catchAsync.util");
const AppError = require("../utils/appError.util");

const getShippingOptions = catchAsync(async (req, res, next) => {
    const shippingOptions = await Shipping.find({ isDeleted: false }).sort({ city: 1 });
    res.status(200).json({
        message: "Shipping options retrieved successfully",
        data: shippingOptions
    });
});

const createShippingOption = catchAsync(async (req, res, next) => {
    const { city, cost } = req.body;
    const shipping = await Shipping.create({ city, cost });
    res.status(201).json({
        message: "Shipping option created successfully",
        data: shipping
    });
});

const updateShippingOption = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { city, cost } = req.body;
    const updateData = {};
    if (city !== undefined) updateData.city = city;
    if (cost !== undefined) updateData.cost = cost;
    const shipping = await Shipping.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true, runValidators: true }
    );
    if (!shipping) {
        return next(new AppError("Shipping option not found", 404));
    }

    res.status(200).json({
        message: "Shipping option updated successfully",
        data: shipping
    });
});

const deleteShippingOption = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const shipping = await Shipping.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true }
    );

    if (!shipping) {
        return next(new AppError("Shipping option not found", 404));
    }

    res.status(200).json({
        message: "Shipping option deleted successfully"
    });
});

module.exports = {
    getShippingOptions,
    createShippingOption,
    updateShippingOption,
    deleteShippingOption
};


