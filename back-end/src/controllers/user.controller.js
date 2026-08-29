const AppError = require("../utils/appError.util");
const { catchAsync } = require("../utils/catchAsync.util.js");
const User = require("../models/user.model.js");

const getMyProfile = catchAsync(async (req, res, next) => {
    const id = req.user._id;
    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    res.status(200).json({
        message: "User retrieved successfully",
        data: user
    });
});

const updateMyProfile = catchAsync(async (req, res, next) => {
    const id = req.user._id;
    const allowedFields = ['name', 'gender', 'address', 'age', 'phone'];
    const updateData = {};
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    });
    const user = await User.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true, runValidators: true }
    );
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    res.status(200).json({
        message: "My Profile updated successfully",
        data: user
    });
});

const deleteMyProfile = catchAsync(async (req, res, next) => {
    const id = req.user._id;
    const user = await User.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true });
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    res.status(200).json({
        message: "My Profile deleted successfully"
    });
});

const getAllUsers = catchAsync(async (req, res, next) => {
    res.status(200).json({
        message: "Users retrieved successfully",
        ...res.paginationResult
    });
});

const getUserById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    res.status(200).json({
        message: "User retrieved successfully",
        data: user
    });
});

const updateUserByAdmin = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status, role } = req.body;
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (role !== undefined) updateData.role = role;
    const user = await User.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true, runValidators: true },
    );
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    res.status(200).json({
        message: "User updated successfully",
        data: user
    });
});

const deleteUserByAdmin = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true });
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    res.status(200).json({
        message: "User deleted successfully",
    });
});

module.exports = {
    getMyProfile,
    updateMyProfile,
    deleteMyProfile,
    getAllUsers,
    getUserById,
    updateUserByAdmin,
    deleteUserByAdmin
};