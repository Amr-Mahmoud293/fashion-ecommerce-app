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
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, "Quantity must be at least 1"],
                default: 1
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],

    totalPrice: {
        type: Number,
        required: true
    },
    shippingAddress: {
        address: String,
        city: String,
        state: String,
        zip: String,
        country: String
    },

    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "received", "cancelled", "rejected"],
        default: "pending"
    },
    shippingFee: {
        type: Number,
        required: true
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