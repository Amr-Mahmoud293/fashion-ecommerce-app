const mongoose = require("mongoose");


const purchaseSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: [true, "Order number is required"]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: [true, "Product reference is required"]
            },
            quantity: {
                type: Number,
                required: [true, "Quantity is required"],
                min: [1, "Quantity must be at least 1"],
                max: [100, "Quantity cannot exceed 100"],
                default: 1
            },
            price: {
                type: Number,
                required: [true, "Price is required"],
                min: [0, "Price cannot be negative"]
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: [true, "Total price is required"],
        min: [0, "Total price cannot be negative"]
    },
    shippingAddress: {
        type: String,
        trim: true,
        required: [true, "Shipping address is required"],
        maxlength: [300, "Shipping address cannot exceed 300 characters"]
    },
    shipping: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "shipping",
        required: [true, "Shipping option is required"]
    },
    status: {
        type: String,
        trim: true,
        enum: {
            values: ["pending", "processing", "shipped", "received", "cancelled", "rejected", "paid"],
            message: "Status must be one of: pending, processing, shipped, received, cancelled, rejected, paid"
        },
        default: "pending"
    },
    shippingFee: {
        type: Number,
        required: [true, "Shipping fee is required"],
        min: [0, "Shipping fee cannot be negative"]
    }
    ,
    isDeleted: {
        type: Boolean,
        default: false
    },
    purchaseAt: {
        type: Date,
        default: Date.now
    },
},
    {
        timestamps: true
    }
);



module.exports = mongoose.model('purchase', purchaseSchema);