const mongoose = require("mongoose");

const placeImageSchema = new mongoose.Schema(
  {
    place_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
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

const PlaceImage =
  mongoose.models.PlaceImage ||
  mongoose.model("PlaceImage", placeImageSchema, "place_images");

module.exports = PlaceImage;
