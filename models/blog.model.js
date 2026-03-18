const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      slug: "title",
      unique: true,
    },

    content: {
      type: String,
      required: true,
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "hidden"],
      default: "draft",
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
