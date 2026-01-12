const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    entity_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true, // query theo entity rất nhiều → nên index
    },

    image_url: {
      type: String,
      required: true,
      trim: true,
    },

    public_id: {
      type: String,
      required: true, // đã dùng Cloudinary thì NÊN required
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Image =
  mongoose.models.Image || mongoose.model("Image", imageSchema, "images");

module.exports = Image;
