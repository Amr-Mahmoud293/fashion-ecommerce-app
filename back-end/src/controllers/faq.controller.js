const AppError = require("../utils/appError.util");
const { catchAsync } = require("../utils/catchAsync.util.js");
const FAQ = require("../models/faq.model.js");

const getFaqById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const faq = await FAQ.findOne({ _id: id, isDeleted: false });
    if (!faq) {
        return next(new AppError("FAQ not found", 404));
    }
    res.status(200).json({
        message: "FAQ retrieved successfully",
        data: faq
    });
});

const getAllFaqs = catchAsync(async (req, res, next) => {
    res.status(200).json({
        message: "FAQs retrieved successfully",
        ...res.paginationResult
    });
});

const createFaq = catchAsync(async (req, res, next) => {
    const { question, answer } = req.body;
    const faq = await FAQ.create({ question, answer });
    res.status(201).json({
        message: "FAQ created successfully",
        data: faq
    });
});

const updateFaq = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { question, answer } = req.body;
    const updateData = {};
    if (question !== undefined) updateData.question = question;
    if (answer !== undefined) updateData.answer = answer;
    const faq = await FAQ.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true, runValidators: true }
    );
    if (!faq) {
        return next(new AppError("FAQ not found", 404));
    }
    res.status(200).json({
        message: "FAQ updated successfully",
        data: faq
    });
});

const deleteFaq = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const faq = await FAQ.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true });
    if (!faq) {
        return next(new AppError("FAQ not found", 404));
    }
    res.status(200).json({
        message: "FAQ deleted successfully"
    });
});

module.exports = {
    getFaqById,
    getAllFaqs,
    createFaq,
    updateFaq,
    deleteFaq
}