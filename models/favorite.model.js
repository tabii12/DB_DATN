const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tour_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
  },
  {
    timestamps: true, 
  },
);

favoriteSchema.index({ user_id: 1, tour_id: 1 }, { unique: true });

const Favorite =
  mongoose.models.Favorite ||
  mongoose.model("Favorite", favoriteSchema, "favorites");

module.exports = Favorite;
