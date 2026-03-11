const mongoose = require("mongoose");

const blogImageSchema = new mongoose.Schema(
  {
    blog_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      index: true,
    },

    image_url: {
      type: String,
      required: true,
      trim: true,
    },

    public_id: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const BlogImage =
  mongoose.models.BlogImage ||
  mongoose.model("BlogImage", blogImageSchema, "blog_images");

module.exports = BlogImage;
