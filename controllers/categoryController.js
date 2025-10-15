const Category = require("../models/categoryModel");

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh mục!",
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Danh mục không tồn tại!",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh mục theo ID:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server!",
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { MaLoai, TenLoai } = req.body;

    if (!MaLoai || !TenLoai) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ Mã loại và Tên loại!",
      });
    }

    const existed = await Category.findOne({ MaLoai });
    if (existed) {
      return res.status(400).json({
        success: false,
        message: "Mã loại đã tồn tại!",
      });
    }

    const newCategory = new Category({ MaLoai, TenLoai });
    await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Thêm danh mục thành công!",
      data: newCategory,
    });
  } catch (error) {
    console.error("❌ Lỗi khi thêm danh mục:", error);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
