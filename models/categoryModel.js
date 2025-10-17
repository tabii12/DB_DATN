const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    TenLoai: {
      type: String,
      required: true,
      trim: true,
    },
  }
);

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema, "categories");

module.exports = Category;
