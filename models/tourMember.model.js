const mongoose = require("mongoose");

const tourMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
      min: 0,
    },

    id_card: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    booked_trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("TourMember", tourMemberSchema);
