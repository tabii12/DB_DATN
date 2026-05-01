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

    tourName: {
      type: String,
      required: true,
      trim: true,
    },

    thumbnail: {
      type: String,
      trim: true,
    },

    departureDate: {
      type: Date,
      required: true,
    },

    adults: {
      type: Number,
      default: 0,
      min: 0,
    },

    children: {
      type: Number,
      default: 0,
      min: 0,
    },

    infants: {
      type: Number,
      default: 0,
      min: 0,
    },

    total_members: {
      type: Number,
      required: true,
      min: 1,
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    total_price: {
      type: Number,
      required: true,
      min: 0,
    },

    singleRooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    payNow: {
      type: Number,
      min: 0,
    },

    remaining: {
      type: Number,
      min: 0,
    },

    paymentPct: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },

    contactName: {
      type: String,
      trim: true,
    },

    contactEmail: {
      type: String,
      trim: true,
    },

    contactPhone: {
      type: String,
      trim: true,
    },

    orderId: {
      type: String,
      trim: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "paid", "cancelled", "refunded"],
      default: "pending",
    },

    vnpay: {
      type: paymentSchema,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

bookingSchema.index({ user_id: 1 });
bookingSchema.index({ trip_id: 1 });
bookingSchema.index({ orderId: 1 });

bookingSchema.set("toJSON", { virtuals: true });
bookingSchema.set("toObject", { virtuals: true });

const Booking =
  mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema, "bookings");

module.exports = Booking;
