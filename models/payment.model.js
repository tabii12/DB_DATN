const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["bank_transfer"],
      default: "bank_transfer",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
      index: true,
    },

    bank_code: {
      type: String,
      required: true,
    },

    bank_account_number: {
      type: String,
      required: true,
    },

    bank_account_name: {
      type: String,
      required: true,
    },

    transfer_content: {
      type: String,
      required: true,
    },

    paid_at: {
      type: Date,
    },

    confirmed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    _id: false,
  },
);

module.exports = paymentSchema;
