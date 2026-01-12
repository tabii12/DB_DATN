const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true, // query payment theo booking rất nhiều
    },

    payment_method: {
      type: String,
      enum: ["vnpay", "momo", "paypal", "stripe", "cash"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    payment_status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    payment_time: {
      type: Date,
      default: null, // chỉ set khi success
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Payment =
  mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema, "payments");

module.exports = Payment;
