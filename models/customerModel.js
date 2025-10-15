const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    MaKH: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    TenKH: {
      type: String,
      required: true,
      trim: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"],
    },
    SDT: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{9,11}$/, "Số điện thoại không hợp lệ"],
    },
    DiaChi: {
      type: String,
      trim: true,
    },
  }
);

const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema, "customers");

module.exports = Customer;
