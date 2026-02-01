const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

const itinerarySchema = new mongoose.Schema(
  {
    tour_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
      index: true,
    },

    day_number: {
      type: Number,
      required: true,
      min: 1,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    meal_note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Itinerary =
  mongoose.models.Itinerary || mongoose.model("Itinerary", itinerarySchema);

module.exports = Itinerary;
