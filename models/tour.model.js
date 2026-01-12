const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    start_date: {
      type: Date,
      required: true,
    },

    end_date: {
      type: Date,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    max_people: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "full"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Tour =
  mongoose.models.Tour || mongoose.model("Tour", tourSchema, "tours");

module.exports = Tour;
