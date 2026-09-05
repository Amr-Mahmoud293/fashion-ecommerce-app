const AppError = require("../utils/appError.util");
const { catchAsync } = require("../utils/catchAsync.util.js");
const Review = require("../models/review.model.js");
const Notification = require("../models/notification.model");

const getMyReview = catchAsync(async (req, res, next) => {
    const id = req.user._id;
    const review = await Review.findOne({ user: id, isDeleted: false });
    if (!review) {
        return next(new AppError("Review not found", 404));
    }
    res.status(200).json({
        message: "Review retrieved successfully",
        data: review
    });
});

const getActiveReviews = catchAsync(async (req, res, next) => {
    res.status(200).json({
        message: "Active Reviews retrieved successfully",
        ...res.paginationResult
    });
});

const createMyReview = catchAsync(async (req, res, next) => {
    const id = req.user._id;
    const existingReview = await Review.findOne({ user: id, isDeleted: false });
    if (existingReview) {
        return next(new AppError("You already have a review", 400));
    }
    const { rating, comment } = req.body;
    const review = await Review.create({ user: id, rating, comment, isApproved: false });
    try {
        await Notification.create({
            title: `New Review by ${req.user.name || "Customer"}`,
            message: `${req.user.name} (${req.user.email}) submitted a ${rating}-star review:\n"${comment || "No comment provided."}"`,
            type: "review"
        });
    } catch (notifError) {
        console.error("Failed to create review notification:", notifError);
    }
    res.status(201).json({
        message: "My Review created successfully",
        data: review
    });
});

const updateMyReview = catchAsync(async (req, res, next) => {
    const id = req.user._id;
    const { rating, comment } = req.body;
    const updateData = { isApproved: false };
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;
    const review = await Review.findOneAndUpdate(
        { user: id, isDeleted: false },
        updateData,
        { new: true, runValidators: true }
    );
    if (!review) {
        return next(new AppError("Review not found", 404));
    }
    res.status(200).json({
        message: "My Review updated successfully",
        data: review
    });
});

const deleteMyReview = catchAsync(async (req, res, next) => {
    const id = req.user._id;
    const review = await Review.findOneAndUpdate(
        { user: id, isDeleted: false },
        { isDeleted: true },
        { new: true });
    if (!review) {
        return next(new AppError("Review not found", 404));
    }
    res.status(200).json({
        message: "My Review deleted successfully"
    });
});

const getAllReviews = catchAsync(async (req, res, next) => {
    res.status(200).json({
        message: "Reviews retrieved successfully",
        ...res.paginationResult
    });
});

const getReviewById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const review = await Review.findOne({ _id: id, isDeleted: false });
    if (!review) {
        return next(new AppError("Review not found", 404));
    }
    res.status(200).json({
        message: "Review retrieved successfully",
        data: review
    });
});

const updateReviewByAdmin = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { isApproved } = req.body;
    if (typeof isApproved !== "boolean") {
        return next(new AppError("isApproved must be a boolean (true or false)", 400));
    }
    const review = await Review.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isApproved },
        { new: true, runValidators: true },
    );
    if (!review) {
        return next(new AppError("Review not found", 404));
    }
    res.status(200).json({
        message: "Review updated successfully",
        data: review
    });
});

const deleteReviewByAdmin = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const review = await Review.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true });
    if (!review) {
        return next(new AppError("Review not found", 404));
    }
    res.status(200).json({
        message: "Review deleted successfully",
    });
});


module.exports = {
    getMyReview,
    getActiveReviews,
    createMyReview,
    updateMyReview,
    deleteMyReview,
    getAllReviews,
    getReviewById,
    updateReviewByAdmin,
    deleteReviewByAdmin
};