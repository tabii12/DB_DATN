const mongoose = require("mongoose");
const paymentSchema = require("./payment.schema");

const bookingSchema = new mongoose.Schema(
  {
    trip_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    booking_date: {
      type: Date,
      default: Date.now,
    },

    total_price: {
      type: Number,
      required: true,
      min: 0,
    },

    total_members: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
      index: true,
    },

    payment: {
      type: paymentSchema,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports =
  mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema, "bookings");
