const mongoose = require("mongoose");

const itineraryDetailSchema = new mongoose.Schema(
  {
    itinerary_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Itinerary",
      required: true,
      index: true,
    },

    place_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["eat", "visit", "move", "rest", "other"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      trim: true,
    },

    order: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const ItineraryDetail =
  mongoose.models.ItineraryDetail ||
  mongoose.model("ItineraryDetail", itineraryDetailSchema, "itinerary_details");

module.exports = ItineraryDetail;
