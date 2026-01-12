const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    discount_type: {
      type: String,
      enum: ["percent", "fixed"],
      required: true,
    },

    discount_value: {
      type: Number,
      required: true,
      min: 0,
    },

    expired_date: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Voucher =
  mongoose.models.Voucher ||
  mongoose.model("Voucher", voucherSchema, "vouchers");

module.exports = Voucher;
