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

    slug: {
      type: String,
      slug: "name",
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    hotel_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true,
    },

    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    base_price: {
      type: Number,
      default: 0,
      min: 0,
    },

    duration_days: {
      type: Number,
      min: 1,
    },

    duration_nights: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Tour =
  mongoose.models.Tour || mongoose.model("Tour", tourSchema, "tours");

module.exports = Tour;
