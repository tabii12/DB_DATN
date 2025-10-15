import Brand from "../models/brandModel.js";
import cloudinary from "../config/cloudinary.js";

const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json({ success: true, data: brands });
  } catch (error) {
    console.error("❌ Lỗi khi lấy thương hiệu:", error);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thương hiệu!" });
    }
    res.status(200).json({ success: true, data: brand });
  } catch (error) {
    console.error("❌ Lỗi khi lấy thương hiệu:", error);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

const createBrand = async (req, res) => {
  try {
    const { MaTH, TenTH } = req.body;

    if (!MaTH || !TenTH) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ Mã thương hiệu và Tên thương hiệu!",
      });
    }

    const existed = await Brand.findOne({ MaTH });
    if (existed) {
      return res.status(400).json({ success: false, message: "Mã thương hiệu đã tồn tại!" });
    }

    let logoUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "brands",
      });
      logoUrl = result.secure_url;
    }

    const newBrand = new Brand({
      MaTH,
      TenTH,
      Logo: logoUrl,
    });

    await newBrand.save();

    res.status(201).json({
      success: true,
      message: "Tạo thương hiệu thành công!",
      data: newBrand,
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo thương hiệu:", error);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand,
};