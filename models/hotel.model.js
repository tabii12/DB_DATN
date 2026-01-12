const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      index: true, // sau này filter theo thành phố rất nhiều
    },

    description: {
      type: String,
      trim: true,
    },

    price_per_night: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "hidden"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Hotel =
  mongoose.models.Hotel || mongoose.model("Hotel", hotelSchema, "hotels");

module.exports = Hotel;
