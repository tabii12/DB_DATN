const categories = require("../models/categoryModel");
const sub_categories = require("../models/sub_categoriesModel");

// ✅ Lấy tất cả danh mục con
const getAllSubCategories = async (req, res) => {
  try {
    const arr = await sub_categories.find().populate("categoryId");
    res.status(200).json(arr);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Lấy chi tiết danh mục con
const getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await sub_categories.findById(req.params.id).populate("categoryId");
    if (!subCategory) {
      return res.status(404).json({ message: "Danh mục con không tồn tại!" });
    }
    res.status(200).json(subCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Tạo danh mục con
const createSubCategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    // Kiểm tra danh mục cha có tồn tại không
    const category = await categories.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Danh mục cha không tồn tại!" });
    }

    // Kiểm tra danh mục con đã tồn tại chưa
    const existingSubCategory = await sub_categories.findOne({ name, categoryId });
    if (existingSubCategory) {
      return res.status(400).json({ message: "Danh mục con đã tồn tại trong danh mục cha này!" });
    }

    // Tạo danh mục con
    const newSubCategory = new sub_categories({ name, categoryId });
    await newSubCategory.save();

    res.status(201).json({
      message: "Tạo danh mục con thành công!",
      subCategory: newSubCategory,
    });
  } catch (error) {
    console.error("Lỗi khi tạo danh mục con:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// ✅ Cập nhật danh mục con
const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId } = req.body;

    const subCategory = await sub_categories.findById(id);
    if (!subCategory) {
      return res.status(404).json({ message: "Danh mục con không tồn tại!" });
    }

    // Kiểm tra danh mục cha nếu có cập nhật
    if (categoryId) {
      const category = await categories.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Danh mục cha không tồn tại!" });
      }
      subCategory.categoryId = categoryId;
    }

    subCategory.name = name || subCategory.name;
    await subCategory.save();

    res.status(200).json({ message: "Cập nhật danh mục con thành công!", subCategory });
  } catch (error) {
    console.error("Lỗi khi cập nhật danh mục con:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// ✅ Xóa danh mục con
const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subCategory = await sub_categories.findById(id);
    if (!subCategory) {
      return res.status(404).json({ message: "Danh mục con không tồn tại!" });
    }

    await subCategory.deleteOne();

    res.status(200).json({ message: "Xóa danh mục con thành công!" });
  } catch (error) {
    console.error("Lỗi khi xóa danh mục con:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// ✅ Xuất các hàm để dùng trong route
module.exports = { 
  getAllSubCategories, 
  getSubCategoryById, 
  createSubCategory, 
  updateSubCategory, 
  deleteSubCategory 
};
