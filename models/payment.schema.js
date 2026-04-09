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
  transfer_content: String,
  transaction_no: String, 
  txn_ref: String,
  response_code: String,
  pay_date: String,
  card_type: String,
  full_response: Object
});

module.exports = paymentSchema;
