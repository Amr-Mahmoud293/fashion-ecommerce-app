const Notification = require("../models/notification.model");
const { catchAsync } = require("../utils/catchAsync.util");
const AppError = require("../utils/appError.util");

const getAllNotifications = catchAsync(async (req, res, next) => {
    const unreadCount = await Notification.countDocuments({ isRead: false, isDeleted: false });
    res.status(200).json({
        message: "Notifications retrieved successfully",
        unreadCount,
        ...res.paginationResult
    });
});

const getNotificationById = catchAsync(async (req, res, next) => {
    const notification = await Notification.findOne({ _id: req.params.id, isDeleted: false });
    if (!notification) {
        return next(new AppError("Notification not found", 404));
    }
    res.status(200).json({
        message: "Notification retrieved successfully",
        data: notification
    });
});

const changeNotificationStatus = catchAsync(async (req, res, next) => {
    const { isRead } = req.body;
    if (typeof isRead !== "boolean") {
        return next(new AppError("isRead is required and must be true or false", 400));
    }
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false },
        { isRead },
        { new: true, runValidators: true }
    );
    if (!notification) {
        return next(new AppError("Notification not found", 404));
    }
    res.status(200).json({
        message: `Notification marked as ${isRead ? 'read' : 'unread'} successfully`,
        data: notification
    });
});

const deleteNotification = catchAsync(async (req, res, next) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false },
        { isDeleted: true },
        { new: true, runValidators: true }
    );
    if (!notification) {
        return next(new AppError("Notification not found", 404));
    }
    res.status(200).json({
        message: "Notification deleted successfully"
    });
});

const readAllNotifications = catchAsync(async (req, res, next) => {
    const result = await Notification.updateMany(
        { isRead: false, isDeleted: false },
        { isRead: true }
    );
    if (result.modifiedCount === 0) {
        return res.status(200).json({
            message: "All notifications are already read"
        });
    }
    res.status(200).json({
        message: "All notifications marked as read successfully",
        updatedCount: result.modifiedCount
    });
});

const deleteAllNotifications = catchAsync(async (req, res, next) => {
    const result = await Notification.updateMany(
        { isDeleted: false },
        { isDeleted: true }
    );
    if (result.modifiedCount === 0) {
        return res.status(200).json({
            message: "All notifications are already deleted"
        });
    }
    res.status(200).json({
        message: "All notifications deleted successfully",
        updatedCount: result.modifiedCount
    });
});

module.exports = {
    getAllNotifications,
    getNotificationById,
    changeNotificationStatus,
    deleteNotification,
    readAllNotifications,
    deleteAllNotifications
};