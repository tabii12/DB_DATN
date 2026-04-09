const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  method: String,
  amount: Number,
  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  bank_code: String,
  bank_account_number: String,
  bank_account_name: String,
  vnpay: Object,
  transfer_content: String,
});

module.exports = paymentSchema;
