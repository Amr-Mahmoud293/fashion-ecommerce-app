const mongoose = require("mongoose");
const Category = require("./category.model");

const subcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: [true, "Category is required"],
    },
    isDeleted: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
}
);

module.exports = mongoose.model("subcategory", subcategorySchema);
