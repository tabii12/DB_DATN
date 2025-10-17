const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Brand = require("../models/brandModel");
const Image = require("../models/imageModel");
const cloudinary = require("../configs/cloudinaryConfig");

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("MaLoai", "TenLoai") 
      .populate("ThuongHieu", "TenTH"); 

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
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
      .populate("MaLoai", "TenLoai")
      .populate("ThuongHieu", "TenTH");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm!",
      });
    }

    const images = await Image.find({ MaDH: product._id });

    res.status(200).json({
      success: true,
      data: { ...product._doc, images },
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy sản phẩm theo ID:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy sản phẩm!",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { TenDH, ThuongHieu, Gia, SoLuong, MaLoai } = req.body;
    const files = req.files;

    if (!TenDH || !ThuongHieu || !Gia || !SoLuong || !MaLoai) {
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

    const newProduct = new Product({
      TenDH,
      ThuongHieu,
      Gia,
      SoLuong,
      MaLoai,
    });
    await newProduct.save();

    if (files && files.length > 0) {
      for (const file of files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });

        const newImage = new Image({
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

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { TenDH, ThuongHieu, Gia, SoLuong, MaLoai } = req.body;
    const files = req.files;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại!",
      });
    }

    if (MaLoai) {
      const foundCategory = await Category.findById(MaLoai);
      if (!foundCategory) {
        return res.status(404).json({ success: false, message: "Danh mục không tồn tại!" });
      }
    }

    if (ThuongHieu) {
      const foundBrand = await Brand.findById(ThuongHieu);
      if (!foundBrand) {
        return res.status(404).json({ success: false, message: "Thương hiệu không tồn tại!" });
      }
    }

    product.TenDH = TenDH || product.TenDH;
    product.ThuongHieu = ThuongHieu || product.ThuongHieu;
    product.Gia = Gia || product.Gia;
    product.SoLuong = SoLuong || product.SoLuong;
    product.MaLoai = MaLoai || product.MaLoai;

    await product.save();

    if (files && files.length > 0) {
      const oldImages = await Image.find({ MaDH: product._id });
      for (const img of oldImages) {
        await cloudinary.uploader.destroy(img.MaAnh);
        await img.deleteOne();
      }

      for (const file of files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });

        const newImage = new Image({
          Url: uploadResult.secure_url,
          MaDH: product._id,
        });
        await newImage.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công!",
      product,
    });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật sản phẩm!",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại!",
      });
    }

    const images = await Image.find({ MaDH: product._id });
    for (const img of images) {
      await cloudinary.uploader.destroy(img.MaAnh);
      await img.deleteOne();
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Xóa sản phẩm thành công!",
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa sản phẩm:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa sản phẩm!",
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
