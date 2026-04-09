const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["bank_transfer", "vnpay"],
      default: "bank_transfer",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    // VNPAY fields
    vnp_Amount: {
      type: String,
      default: null
    },
    vnp_BankCode: {
      type: String,
      default: null
    },
    vnp_BankTranNo: {
      type: String,
      default: null
    },
    vnp_CardType: {
      type: String,
      default: null
    },
    vnp_OrderInfo: {
      type: String,
      default: null
    },
    vnp_PayDate: {
      type: Date,
      default: null
    },
    vnp_ResponseCode: {
      type: String,
      default: null
    },
    vnp_TmnCode: {
      type: String,
      default: null
    },
    vnp_TransactionNo: {
      type: String,
      default: null
    },
    vnp_TransactionStatus: {
      type: String,
      default: null
    },
    vnp_TxnRef: {
      type: String,
      default: null
    },

    // Bank transfer fallback
    bank_code: {
      type: String,
      default: null
    },
    bank_account_number: {
      type: String,
      default: null
    },
    bank_account_name: {
      type: String,
      default: null
    },
    transfer_content: {
      type: String,
      default: null
    },

    paid_at: {
      type: Date,
      default: null, // 👈 chỉ có khi paid
    },

    confirmed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // 👈 admin xác nhận
    },

    note: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false, // 👈 embedded schema chuẩn
  },
);

module.exports = paymentSchema;
