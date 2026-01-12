const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
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

    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "completed"],
      default: "pending",
      index: true,
    },

    voucher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Booking =
  mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema, "bookings");

module.exports = Booking;
