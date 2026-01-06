const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    Url: {
      type: String,
      required: true,
      trim: true,
    },
    PublicId: {
      type: String,
      required: true,
      trim: true,
    },
    ProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  }
);

const Image = mongoose.models.Image || mongoose.model("Image", imageSchema, "images");

module.exports = Image;
