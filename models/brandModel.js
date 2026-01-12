const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    TenTH: {
      type: String,
      required: true,
      trim: true,
    },
    Logo: {
      type: String,
      trim: true,
      default: "",
    },
  }
);

const Brand = mongoose.models.Brand || mongoose.model("Brand", brandSchema, "brands");

module.exports = Brand;
