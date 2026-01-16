const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    trip_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip", // Giả định tên model là Trip
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
      required: true,
    },

    total_price: {
      type: Number,
      required: true,
      min: 0,
    },

    payment_method: {
      type: String,
      required: true,
      // Bạn có thể thêm enum nếu có các phương thức cố định như ['credit_card', 'cash', 'vnpay']
    },

    total_members: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "completed"], // Các trạng thái phổ biến
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
    versionKey: false,
  }
);

const Booking =
  mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema, "bookings");

module.exports = Booking;
