const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Brand = require("../models/brandModel");
const Image = require("../models/imageModel");
const cloudinary = require("../configs/cloudinaryConfig");

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("MaLoai")   
      .populate("ThuongHieu")
      .populate("images"); 

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách sản phẩm!",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate("MaLoai")
      .populate("ThuongHieu")
      .populate("images");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm!",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo ID:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy sản phẩm!",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { MaDH, TenDH, ThuongHieu, Gia, SoLuong, MaLoai } = req.body;
    const file = req.file;

    if (!MaDH || !TenDH || !ThuongHieu || !Gia || !SoLuong || !MaLoai) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin sản phẩm!",
      });
    }

    const foundCategory = await Category.findById(MaLoai);
    const foundBrand = await Brand.findById(ThuongHieu);

    if (!foundCategory) {
      return res.status(404).json({ success: false, message: "Danh mục không tồn tại!" });
    }
    if (!foundBrand) {
      return res.status(404).json({ success: false, message: "Thương hiệu không tồn tại!" });
    }

    const existedProduct = await Product.findOne({ MaDH });
    if (existedProduct) {
      return res.status(400).json({
        success: false,
        message: "Mã sản phẩm đã tồn tại!",
      });
    }

    const newProduct = new Product({
      MaDH,
      TenDH,
      ThuongHieu,
      Gia,
      SoLuong,
      MaLoai,
    });
    await newProduct.save();

    const files = req.files; // mảng các file upload

    if (files && files.length > 0) {
      for (const file of files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });

        const newImage = new Image({
          MaAnh: uploadResult.public_id,
          Url: uploadResult.secure_url,
          MaDH: newProduct._id,
        });

        await newImage.save();
      }
    }

    res.status(201).json({
      success: true,
      message: "Thêm sản phẩm thành công!",
      product: newProduct,
    });
  } catch (error) {
    console.error("❌ Lỗi khi thêm sản phẩm:", error);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
};
