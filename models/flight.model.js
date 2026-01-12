const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema(
  {
    flight_code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    departure: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    departure_time: {
      type: Date,
      required: true,
    },

    arrival_time: {
      type: Date,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["available", "full", "cancelled"],
      default: "available",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Flight =
  mongoose.models.Flight || mongoose.model("Flight", flightSchema, "flights");

module.exports = Flight;
