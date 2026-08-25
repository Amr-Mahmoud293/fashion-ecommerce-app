const mongoose = require("mongoose");

const shippingSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: [true, "City/Governorate name is required"],
      unique: true,
      trim: true
    },
    cost: {
      type: Number,
      required: [true, "Shipping cost is required"],
      min: [0, "Cost must be at least 0"]
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("shipping", shippingSchema);