const mongoose = require("mongoose");


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        trim: true,
        unique: true,
    },
    slug: {
        type: String,
        required: [true, "Slug is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
},
    { timestamps: true }

);

module.exports = mongoose.model("category", categorySchema);
