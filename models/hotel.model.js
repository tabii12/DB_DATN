const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      slug: "name",
      unique: true,
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
      index: true,
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
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "hidden"],
      default: "active",
    },
    capacity: {
    type: Number,
    default: 2, // mặc định 2 người / phòng
  },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Hotel =
  mongoose.models.Hotel || mongoose.model("Hotel", hotelSchema, "hotels");
module.exports = Hotel;
