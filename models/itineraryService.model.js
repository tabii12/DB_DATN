const mongoose = require("mongoose");

const itineraryServiceSchema = new mongoose.Schema(
  {
    itinerary_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Itinerary",
      required: true,
      index: true,
    },

    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const ItineraryService =
  mongoose.models.ItineraryService ||
  mongoose.model(
    "ItineraryService",
    itineraryServiceSchema,
    "itinerary_services",
  );

module.exports = ItineraryService;
