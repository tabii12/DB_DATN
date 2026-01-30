const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "full"],
      default: "active",
    },
    slug: {
      type: String,
      slug: "name",
      unique: true,
    },
    hotel_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel", // Tên model của bảng khách sạn
      required: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Tên model của bảng danh mục
      required: true,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Tour =
  mongoose.models.Tour || mongoose.model("Tour", tourSchema, "tours");

module.exports = Tour;
