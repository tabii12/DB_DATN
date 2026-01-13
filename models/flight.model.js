const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema(
  {
    flight_code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    departure: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    departure_time: {
      type: Date,
      required: true,
    },

    arrival_time: {
      type: Date,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["available", "full", "cancelled"],
      default: "available",
    },

    total_seats: { 
        type: Number, 
        required: true, 
        default: 100 // Tổng số ghế trên máy bay
    },
    
    booked_seats: { 
        type: Number, 
        default: 0 // Số ghế đã được đặt thành công
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

flightSchema.virtual('available_seats').get(function() {
    return this.total_seats - this.booked_seats;
});

const Flight =
  mongoose.models.Flight || mongoose.model("Flight", flightSchema, "flights");

module.exports = Flight;
