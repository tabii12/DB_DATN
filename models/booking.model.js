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

    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    departureDate: {
      type: Date,
      required: true
    },
    hotelName: {
      type: String,
      trim: true
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0
    },
    singleRooms: {
      type: Number,
      default: 0,
      min: 0
    },
    thumbnail: {
      type: String,
      trim: true
    },
    tourName: {
      type: String,
      required: true,
      trim: true
    },
    tourSlug: {
      type: String,
      required: true,
      trim: true
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
    total_price: {
      type: Number,
      required: true,
      min: 0,
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
