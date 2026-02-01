const mongoose = require("mongoose");

const tourImageSchema = new mongoose.Schema(
  {
    tour_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
      index: true,
    },

    image_url: {
      type: String,
      required: true,
      trim: true,
    },

    public_id: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const TourImage =
  mongoose.models.TourImage ||
  mongoose.model("TourImage", tourImageSchema, "tour_images");

module.exports = TourImage;
