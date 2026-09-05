const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [3, "Name must be at least 3 characters long"],
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price must be at least 0"],
    },
    imageURL: {
        type: String,
        required: true
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: [true, "Category is required"],
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subcategory",
        required: [true, "SubCategory is required"],
    },
    stock: {
        type: Number,
        required: [true, "Stock is required"],
        min: [0, "Stock must be at least 0"],
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    isTop: {
        type: Boolean,
        default: false,
    },
    isNewArrival: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },


},
    { timestamps: true }

);
module.exports = mongoose.model("product", productSchema);