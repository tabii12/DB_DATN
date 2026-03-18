const mongoose = require("mongoose");

const descriptionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      
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
