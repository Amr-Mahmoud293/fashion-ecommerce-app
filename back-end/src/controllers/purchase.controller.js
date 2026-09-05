const mongoose = require("mongoose");
const Cart = require("../models/cart.model");
const Product = require("../models/product/product.model");
const Purchase = require("../models/purchase.model");
const Shipping = require("../models/shipping.model");
const Notification = require("../models/notification.model");
const { catchAsync } = require("../utils/catchAsync.util");
const AppError = require("../utils/appError.util");

const SAVE_STOCK = 5;
const POPULATE_PRODUCT_FIELDS = "name price imageURL isActive isDeleted stock";

const createPurchase = catchAsync(async (req, res, next) => {
    const { shippingAddress, shippingId } = req.body;
    if (!shippingAddress) {
        return next(new AppError("Shipping address is required", 400));
    }
    if (!shippingId) {
        return next(new AppError("Shipping option is required", 400));
    }
    const shipping = await Shipping.findOne({ _id: shippingId, isDeleted: false });
    if (!shipping) {
        return next(new AppError("Selected shipping option is no longer available", 400));
    }
    const shippingFee = shipping.cost;
    const cart = await Cart.findOne({ user: req.user._id })
        .populate("items.product", POPULATE_PRODUCT_FIELDS);
    if (!cart || cart.items.length === 0) {
        return next(new AppError("Cart is empty. Add items before placing an order.", 400));
    }
    if (cart.changedItems && cart.changedItems.length > 0) {
        return next(
            new AppError(
                "Your cart has pending price or stock changes. Please review and accept them before checkout.",
                400
            )
        );
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    const lowStockNotifications = [];
    try {
        const purchaseProducts = [];
        let totalPrice = 0;
        for (const cartItem of cart.items) {
            const product = await Product.findById(cartItem.product._id).session(session);
            if (!product || product.isDeleted || !product.isActive) {
                throw new AppError(
                    `Product "${cartItem.product.name}" is no longer available.`,
                    400
                );
            }
            if (product.stock < cartItem.quantity) {
                throw new AppError(
                    `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${cartItem.quantity}.`,
                    400
                );
            }
            product.stock -= cartItem.quantity;
            await product.save({ session });
            if (product.stock <= SAVE_STOCK) {
                lowStockNotifications.push({
                    title: `Low Stock Alert for ${product.name}`,
                    message: `${product.name} has only ${product.stock} units left.`,
                    type: "stock_alert"
                });
            }
            const itemTotal = cartItem.priceAtAddition * cartItem.quantity;
            totalPrice += itemTotal;
            purchaseProducts.push({
                product: product._id,
                quantity: cartItem.quantity,
                price: cartItem.priceAtAddition
            });
        }
        const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
        const [purchase] = await Purchase.create(
            [{
                orderNumber,
                user: req.user._id,
                products: purchaseProducts,
                totalPrice: totalPrice + shippingFee,
                shippingAddress: shippingAddress,
                shipping: shipping._id,
                shippingFee: shippingFee,
                status: "pending"
            }],
            { session }
        );
        const itemsDetails = cart.items.map(item => {
            return `- ${item.product.name} (Qty: ${item.quantity} | Price: $${item.priceAtAddition})`;
        }).join("\n");
        const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        const grandTotal = totalPrice + Number(shippingFee);
        const orderMessage =
            `New order placed by: ${req.user.name} (${req.user.email})

Order Number: #${orderNumber}

Items:
${itemsDetails}

Total Items Quantity: ${totalQuantity}
Items Total: $${totalPrice}
Shipping Fee: $${Number(shippingFee)}
Grand Total: $${grandTotal}
Shipping Address: ${shippingAddress} (${shipping.city}) `;
        cart.items = [];
        cart.changedItems = [];
        cart.totalCartPrice = 0;
        await cart.save({ session });
        await session.commitTransaction();
        session.endSession();
        try {
            await Notification.create({
                title: `New Order Placed #${orderNumber}`,
                message: orderMessage,
                type: "order"
            });
            if (lowStockNotifications.length > 0) {
                await Notification.insertMany(lowStockNotifications);
            }
        } catch (notifError) {
            console.error("Failed to create order/stock notifications:", notifError);
        }
        await purchase.populate("products.product", "name price imageURL");
        res.status(201).json({
            message: "Order placed successfully",
            data: purchase
        });
    } catch (err) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();
        return next(new AppError("Something went wrong while placing the order. Please try again.", 500));
    }
});

const getMyPurchases = catchAsync(async (req, res, next) => {
    const purchases = await Purchase.find({ user: req.user._id, isDeleted: false })
        .populate("products.product", "name price imageURL")
        .sort("-createdAt");
    res.status(200).json({
        message: "Purchases retrieved successfully",
        data: purchases
    });
});

const getPurchaseById = catchAsync(async (req, res, next) => {
    const purchase = await Purchase.findOne({
        _id: req.params.id,
        user: req.user._id,
        isDeleted: false
    }).populate("products.product", "name price imageURL");
    if (!purchase) {
        return next(new AppError("Order not found", 404));
    }
    res.status(200).json({
        message: "Purchase retrieved successfully",
        data: purchase
    });
});

const cancelPurchase = catchAsync(async (req, res, next) => {
    const purchase = await Purchase.findOne({
        _id: req.params.id,
        user: req.user._id,
        isDeleted: false
    });
    if (!purchase) {
        return next(new AppError("Order not found", 404));
    }
    if (purchase.status !== "pending" && purchase.status !== "processing") {
        return next(
            new AppError(
                `Cannot cancel an order that is already "${purchase.status}".`,
                400
            )
        );
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        for (const item of purchase.products) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } },
                { session }
            );
        }
        purchase.status = "cancelled";
        await purchase.save({ session });
        await session.commitTransaction();
        session.endSession();
        res.status(200).json({
            message: "Order cancelled successfully",
            data: purchase
        });
    } catch (err) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();
        return next(new AppError("Failed to cancel the order. Please try again.", 500));
    }
});

const getAllOrders = catchAsync(async (req, res, next) => {
    res.status(200).json({
        message: "All orders retrieved successfully",
        ...res.paginationResult
    });
});

const changeOrderStatus = catchAsync(async (req, res, next) => {
    const { status: newStatus } = req.body;
    if (!newStatus) {
        return next(new AppError("New status is required", 400));
    }
    const allowedStatuses = ["pending", "processing", "shipped", "received", "cancelled", "rejected", "paid"];
    if (!allowedStatuses.includes(newStatus)) {
        return next(new AppError(`Invalid status. Must be one of: ${allowedStatuses.join(", ")}`, 400));
    }
    const purchase = await Purchase.findOne({
        _id: req.params.id,
        isDeleted: false
    });
    if (!purchase) {
        return next(new AppError("Order not found", 404));
    }
    if (purchase.status === newStatus) {
        return next(new AppError(`Order is already "${newStatus}"`, 400));
    }
    const requiresStockRestore = ["cancelled", "rejected"].includes(newStatus);
    if (requiresStockRestore) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            for (const item of purchase.products) {
                await Product.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: item.quantity } },
                    { session }
                );
            }
            purchase.status = newStatus;
            await purchase.save({ session });
            await session.commitTransaction();
            session.endSession();
        } catch (err) {
            if (session.inTransaction()) {
                await session.abortTransaction();
            }
            session.endSession();
            return next(new AppError("Failed to update order status. Please try again.", 500));
        }
    } else {
        purchase.status = newStatus;
        await purchase.save();
    }
    await purchase.populate([
        { path: "user", select: "name email" },
        { path: "products.product", select: "name price imageURL" }
    ]);
    res.status(200).json({
        message: `Order status updated to "${newStatus}" successfully`,
        data: purchase
    });
});

module.exports = {
    createPurchase,
    getMyPurchases,
    getPurchaseById,
    cancelPurchase,
    getAllOrders,
    changeOrderStatus
};
