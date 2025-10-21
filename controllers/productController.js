const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Brand = require("../models/brandModel");
const Image = require("../models/imageModel");
const cloudinary = require("../configs/cloudinaryConfig");

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("MaLoai", "TenLoai")
      .populate("ThuongHieu", "TenTH")
      .select("TenDH Gia SoLuong MaLoai ThuongHieu"); 

    const productsWithImages = await Promise.all(
      products.map(async (p) => {
        const images = await Image.find({ MaDH: p._id }).select("Url");
        return {
          _id: p._id,
          TenDH: p.TenDH,
          Gia: p.Gia,
          SoLuong: p.SoLuong,
          MaLoai: p.MaLoai?.TenLoai || null,
          ThuongHieu: p.ThuongHieu?.TenTH || null,
          images: images.map(i => i.Url),
        };
      })
    );

    res.status(200).json({ success: true, data: productsWithImages });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server khi lấy sản phẩm!" });
  }
};


const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("MaLoai", "TenLoai")
      .populate("ThuongHieu", "TenTH")
      .select("TenDH Gia SoLuong MaLoai ThuongHieu");

    if (!product)
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm!" });

    const images = await Image.find({ MaDH: product._id }).select("Url");

    res.status(200).json({
      success: true,
      data: {
        _id: product._id,
        TenDH: product.TenDH,
        Gia: product.Gia,
        SoLuong: product.SoLuong,
        MaLoai: product.MaLoai?.TenLoai || null,
        ThuongHieu: product.ThuongHieu?.TenTH || null,
        images: images.map(i => i.Url),
      },
    });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server khi lấy sản phẩm!" });
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

    if (!foundCategory)
      return res.status(404).json({ success: false, message: "Danh mục không tồn tại!" });
    if (!foundBrand)
      return res.status(404).json({ success: false, message: "Thương hiệu không tồn tại!" });

    const newProduct = await Product.create({
      TenDH,
      ThuongHieu,
      Gia,
      SoLuong,
      MaLoai,
    });

    if (files && files.length > 0) {
      for (const file of files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });

        await Image.create({
          Url: uploadResult.secure_url,
          PublicId: uploadResult.public_id, 
          MaDH: newProduct._id,
        });
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
    if (!product) return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại!" });

    if (MaLoai && !(await Category.findById(MaLoai)))
      return res.status(404).json({ success: false, message: "Danh mục không tồn tại!" });

    if (ThuongHieu && !(await Brand.findById(ThuongHieu)))
      return res.status(404).json({ success: false, message: "Thương hiệu không tồn tại!" });

    Object.assign(product, {
      TenDH: TenDH || product.TenDH,
      ThuongHieu: ThuongHieu || product.ThuongHieu,
      Gia: Gia || product.Gia,
      SoLuong: SoLuong || product.SoLuong,
      MaLoai: MaLoai || product.MaLoai,
    });
    await product.save();

    if (files && files.length > 0) {
      const oldImages = await Image.find({ MaDH: product._id });
      for (const img of oldImages) {
        if (img.PublicId) await cloudinary.uploader.destroy(img.PublicId);
        await img.deleteOne();
      }

      for (const file of files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });

        await Image.create({
          Url: uploadResult.secure_url,
          PublicId: uploadResult.public_id,
          MaDH: product._id,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công!",
      product,
    });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi cập nhật sản phẩm!" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại!" });

    const images = await Image.find({ MaDH: product._id });
    for (const img of images) {
      if (img.PublicId) await cloudinary.uploader.destroy(img.PublicId);
      await img.deleteOne();
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Xóa sản phẩm thành công!",
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa sản phẩm:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi xóa sản phẩm!" });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
