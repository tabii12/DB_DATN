const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
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
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "hidden"],
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Blog =
  mongoose.models.Blog || mongoose.model("Blog", blogSchema, "blogs");

module.exports = Blog;
