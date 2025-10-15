const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    MaAnh: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    Url: {
      type: String,
      required: true,
      trim: true,
    },
    MaDH: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  }
);

const Image = mongoose.models.Image || mongoose.model("Image", imageSchema, "images");

module.exports = Image;
