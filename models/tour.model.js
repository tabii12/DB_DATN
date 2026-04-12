const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      slug: "name",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    start_location: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

tourSchema.virtual("images", {
  ref: "TourImage",
  localField: "_id",
  foreignField: "tour_id",
});

tourSchema.set("toObject", { virtuals: true });
tourSchema.set("toJSON", { virtuals: true });

const Tour =
  mongoose.models.Tour || mongoose.model("Tour", tourSchema, "tours");

module.exports = Tour;
