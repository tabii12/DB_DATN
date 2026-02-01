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
      index: true, // hay query theo trip → nên index
    },
  },
  {
    timestamps: true,
    versionKey: false, 
  },
);

const TourMember =
  mongoose.models.TourMember ||
  mongoose.model("TourMember", tourMemberSchema, "tour_members");

module.exports = TourMember;
