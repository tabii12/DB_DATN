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
      min: 0,
    },

    id_card: {
      type: String,
      trim: true,
    },

    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    is_owner: {
      type: Boolean,
      default: false,
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
