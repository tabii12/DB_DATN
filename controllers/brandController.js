const Brand = require("../models/brandModel");
const cloudinary = require("../configs/cloudinaryConfig");

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
    const { TenTH } = req.body;

    if (!TenTH) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập Tên thương hiệu!",
      });
    }

    const existed = await Brand.findOne({ TenTH });
    if (existed) {
      return res.status(400).json({ success: false, message: "Tên thương hiệu đã tồn tại!" });
    }

    let logoUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "brands",
      });
      logoUrl = result.secure_url;
    }

    const newBrand = new Brand({
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

const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { TenTH } = req.body;
    const file = req.file;

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ success: false, message: "Thương hiệu không tồn tại!" });
    }

    if (file) {
      if (brand.Logo) {
        const publicId = brand.Logo.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`brands/${publicId}`);
      }

      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: "brands",
      });
      brand.Logo = uploadResult.secure_url;
    }

    brand.TenTH = TenTH || brand.TenTH;
    await brand.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật thương hiệu thành công!",
      data: brand,
    });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật thương hiệu:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi cập nhật thương hiệu!" });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(404).json({ success: false, message: "Thương hiệu không tồn tại!" });
    }

    if (brand.Logo) {
      const publicId = brand.Logo.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`brands/${publicId}`);
    }

    await brand.deleteOne();

    res.status(200).json({
      success: true,
      message: "Xóa thương hiệu thành công!",
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa thương hiệu:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi xóa thương hiệu!" });
  }
};

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};
