const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    tour_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Sale =
  mongoose.models.Sale || mongoose.model("Sale", saleSchema, "sales");

module.exports = Sale;
