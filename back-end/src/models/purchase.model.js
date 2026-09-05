const mongoose = require("mongoose");


const purchaseSchema = new mongoose.Schema({
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
        address: { type: String, trim: true, maxlength: [200, "Address cannot exceed 200 characters"] },
        city: { type: String, trim: true, maxlength: [100, "City cannot exceed 100 characters"] },
        state: { type: String, trim: true, maxlength: [100, "State cannot exceed 100 characters"] },
        zip: { type: String, trim: true, maxlength: [20, "Zip code cannot exceed 20 characters"] },
        country: { type: String, trim: true, maxlength: [100, "Country cannot exceed 100 characters"] }
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