const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên sản phẩm (bắt buộc)
  price: { type: Number, required: true, min: 0 }, // Giá sản phẩm (bắt buộc, >= 0)
  images: { type: [String], required: true }, // Danh sách hình ảnh (mảng chuỗi)
  sub_category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "sub_categories",
    required: true
  }, // Liên kết với danh mục con (bắt buộc)
  description: { type: String }, // Mô tả sản phẩm
});

const Product = mongoose.model("products", productSchema);

module.exports = Product;