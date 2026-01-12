const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    service_type: {
      type: String,
      enum: ["hotel", "flight", "tour", "entertainment"],
      required: true,
      index: true,
    },

    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true, // query review theo service rất nhiều
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Review =
  mongoose.models.Review || mongoose.model("Review", reviewSchema, "reviews");

module.exports = Review;
