const mongoose = require("mongoose");
const paymentSchema = require("./payment.schema");

const bookingSchema = new mongoose.Schema(
  {
    trip_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

    adults: {
      type: Number,
      default: 0,
      min: 0
    },
    children: {
      type: Number,
      default: 0,
      min: 0
    },
    infants: {
      type: Number,
      default: 0,
      min: 0
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
    },

    payment: {
      type: paymentSchema,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

bookingSchema.virtual("members", {
  ref: "TourMember",
  localField: "_id",
  foreignField: "booking_id",
});

bookingSchema.set("toJSON", { virtuals: true });
bookingSchema.set("toObject", { virtuals: true });

const Booking =
  mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema, "bookings");

module.exports = Booking;
