const mongoose = require("mongoose");


const cartSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true,
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, "Quantity must be at least 1"],
                default: 1
            },
            priceAtAddition: {
                type: Number,
                required: true,
                min: 0,
            },
            _id: false,
        }
    ],
    changedItems: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product",
                required: true,
            },
            oldQuantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1
            },
            newQuantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1
            },
            oldPrice: {
                type: Number,
                required: true,
                min: 0
            },
            newPrice: {
                type: Number,
                required: true,
                min: 0
            },
            priceChanged: {
                type: Boolean,
                default: false
            },
            quantityChanged: {
                type: Boolean,
                default: false
            },
            _id: false
        }
    ],
    totalCartPrice: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Total cart price cannot be negative"]
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('cart', cartSchema);
