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
    console.error("❌ Lỗi khi lấy danh mục:", error);
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
    console.error("❌ Lỗi khi lấy danh mục theo ID:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server!",
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { TenLoai } = req.body;

    if (!TenLoai) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập Tên loại!",
      });
    }

    const existed = await Category.findOne({ TenLoai });
    if (existed) {
      return res.status(400).json({
        success: false,
        message: "Tên loại đã tồn tại!",
      });
    }

    const newCategory = new Category({ TenLoai });
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

const updateCategory = async (req, res) => {
  try {
    const { TenLoai } = req.body;
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Danh mục không tồn tại!",
      });
    }

    category.TenLoai = TenLoai || category.TenLoai;
    await category.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật danh mục thành công!",
      data: category,
    });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật danh mục:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật danh mục!",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Danh mục không tồn tại!",
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Xóa danh mục thành công!",
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa danh mục:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa danh mục!",
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
