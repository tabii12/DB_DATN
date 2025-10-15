const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    MaDH: {
      type: String,
      required: true,
      unique: true,
    },
    TenDH: {
      type: String,
      required: true,
    },
    ThuongHieu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    Gia: {
      type: Number,
      required: true,
      min: 0,
    },
    SoLuong: {
      type: Number,
      required: true,
      min: 0,
    },
    MaLoai: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true } 
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema, "products");

module.exports = Product;
