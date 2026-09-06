const Purchase = require("../models/purchase.model");
const { catchAsync } = require("../utils/catchAsync.util");
const AppError = require("../utils/appError.util");

const getSalesReports = catchAsync(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date("2026-01-01");
    const end = endDate ? new Date(endDate) : new Date();
    if (start > end) {
        return next(new AppError("startDate cannot be later than endDate.", 400));
    }
    const matchStage = {
        isDeleted: { $ne: true },
        status: { $nin: ["cancelled", "rejected"] },
        purchaseAt: {
            $gte: start,
            $lte: end
        }
    };
    const summary = await Purchase.aggregate([
        { $match: matchStage },
        {
            $facet: {
                topProducts: [
                    { $unwind: "$products" },
                    {
                        $group: {
                            _id: "$products.product",
                            totalRevenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
                            totalQuantity: { $sum: "$products.quantity" },
                            totalOrders: { $sum: 1 }
                        }
                    },
                    { $sort: { totalRevenue: -1 } },
                    { $limit: 5 },
                    {
                        $lookup: {
                            from: "products",
                            localField: "_id",
                            foreignField: "_id",
                            as: "product"
                        }
                    },
                    {
                        $unwind: "$product"
                    },
                    {
                        $project: {
                            _id: "$_id",
                            productId: "$_id",
                            name: "$product.name",
                            price: "$product.price",
                            imageURL: "$product.imageURL",
                            totalRevenue: { $round: ["$totalRevenue", 2] },
                            totalQuantity: 1,
                            totalOrders: 1
                        }
                    }
                ],
                topUsers: [
                    {
                        $group: {
                            _id: "$user",
                            totalSpent: { $sum: "$totalPrice" },
                            totalQuantity: { $sum: { $sum: "$products.quantity" } },
                            totalOrders: { $sum: 1 }
                        }
                    },
                    { $sort: { totalSpent: -1 } },
                    { $limit: 5 },
                    {
                        $lookup: {
                            from: "users",
                            localField: "_id",
                            foreignField: "_id",
                            as: "user"
                        }
                    },
                    {
                        $unwind: "$user"
                    },
                    {
                        $project: {
                            _id: "$_id",
                            userId: "$_id",
                            name: "$user.name",
                            email: "$user.email",
                            totalSpent: { $round: ["$totalSpent", 2] },
                            totalQuantity: 1,
                            totalOrders: 1
                        }
                    }
                ],
                yearly: [
                    {
                        $group: {
                            _id: { $year: "$purchaseAt" },
                            totalRevenue: { $sum: "$totalPrice" },
                            totalQuantity: { $sum: { $sum: "$products.quantity" } },
                            totalPurchases: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id": 1 } },
                    {
                        $project: {
                            _id: 0,
                            year: "$_id",
                            totalRevenue: { $round: ["$totalRevenue", 2] },
                            totalQuantity: 1,
                            totalPurchases: 1
                        }
                    }
                ],
                monthly: [
                    {
                        $group: {
                            _id: {
                                year: { $year: "$purchaseAt" },
                                month: { $month: "$purchaseAt" }
                            },
                            totalRevenue: { $sum: "$totalPrice" },
                            totalQuantity: { $sum: { $sum: "$products.quantity" } },
                            totalPurchases: { $sum: 1 }
                        }
                    },
                    {
                        $sort: {
                            "_id.year": 1,
                            "_id.month": 1
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            year: "$_id.year",
                            month: "$_id.month",
                            totalRevenue: { $round: ["$totalRevenue", 2] },
                            totalQuantity: 1,
                            totalPurchases: 1
                        }
                    }
                ],
                weekly: [
                    {
                        $group: {
                            _id: {
                                $dateTrunc: {
                                    date: "$purchaseAt",
                                    unit: "week",
                                    startOfWeek: "saturday"
                                }
                            },
                            totalRevenue: { $sum: "$totalPrice" },
                            totalQuantity: { $sum: { $sum: "$products.quantity" } },
                            totalPurchases: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id": 1 } },
                    {
                        $project: {
                            _id: 0,
                            weekStart: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$_id"
                                }
                            },
                            totalRevenue: { $round: ["$totalRevenue", 2] },
                            totalQuantity: 1,
                            totalPurchases: 1
                        }
                    }
                ]
            }
        }
    ]);
    const startLabel = startDate || "2026-01-01";
    const endLabel = endDate || end.toISOString();
    res.status(200).json({
        message: `Sales reports from ${startLabel} to ${endLabel} are fetched successfully`,
        data: summary
    });
});

module.exports = {
    getSalesReports
};