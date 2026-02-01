const mongoose = require("mongoose");

const descriptionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    tour_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Description =
  mongoose.models.Description ||
  mongoose.model("Description", descriptionSchema, "descriptions");

module.exports = Description;
