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

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    departureDate: {
      type: Date,
      required: true,
    },

    hotelName: {
      type: String,
      trim: true,
    },

    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    singleRooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    thumbnail: {
      type: String,
      trim: true,
    },

    tourName: {
      type: String,
      required: true,
      trim: true,
    },

    tourSlug: {
      type: String,
      required: true,
      trim: true,
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

    paymentPct: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },

    payNow: {
      type: Number,
      min: 0,
    },

    remaining: {
      type: Number,
      min: 0,
    },

    total: {
      type: Number,
      min: 0,
    },

    orderId: {
      type: String,
      trim: true,
      unique: true,
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

    total_price: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },

    paymentStatus: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },

    vnpay: {
      type: Object,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// 🔥 Index tối ưu query
bookingSchema.index({ user_id: 1 });
bookingSchema.index({ trip_id: 1 });

// Virtuals
bookingSchema.set("toJSON", { virtuals: true });
bookingSchema.set("toObject", { virtuals: true });

const Booking =
  mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema, "bookings");

module.exports = Booking;
