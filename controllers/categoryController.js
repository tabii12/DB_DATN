const categories = require("../models/categoryModel");

// ✅ Hàm lấy tất cả danh mục
const getAllCategories = async (req, res) => {
  try {
    const arr = await categories.find();
    res.status(200).json(arr);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Hàm lấy chi tiết 1 danh mục
const getCategoryById = async (req, res) => {
  try {
    const category = await categories.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Danh mục không tồn tại!" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Hàm tạo danh mục
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Tên danh mục là bắt buộc!" });
    }

    const existingCategory = await categories.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Danh mục đã tồn tại!" });
    }

    const newCategory = new categories({ name });
    await newCategory.save();

    return res.status(201).json({ message: "Tạo danh mục thành công!", category: newCategory });
  } catch (error) {
    console.error("Lỗi khi tạo danh mục:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// ✅ Hàm cập nhật danh mục
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await categories.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Danh mục không tồn tại!" });
    }

    category.name = name || category.name;
    await category.save();

    return res.status(200).json({ message: "Cập nhật danh mục thành công!", category });
  } catch (error) {
    console.error("Lỗi khi cập nhật danh mục:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// ✅ Hàm xóa danh mục
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await categories.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Danh mục không tồn tại!" });
    }

    await category.deleteOne();

    return res.status(200).json({ message: "Xóa danh mục thành công!" });
  } catch (error) {
    console.error("Lỗi khi xóa danh mục:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
