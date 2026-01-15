const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const entertainmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      slug: "name",
      unique: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
      index: true, // rất hay filter theo địa điểm
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    available_date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["available", "sold_out", "inactive"],
      default: "available",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Entertainment =
  mongoose.models.Entertainment ||
  mongoose.model("Entertainment", entertainmentSchema, "entertainments");

module.exports = Entertainment;
