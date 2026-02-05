const Category = require("../models/category.model");

const createCategory = async (req, res) => {
  try {
    const { name, status } = req.body;

    const category = await Category.create({
      name,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo category thành công",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const categories = await Category.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug }).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy category",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, status } = req.body;

    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy category",
      });
    }

    if (name !== undefined) category.name = name;
    if (status !== undefined) category.status = status;

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật category thành công",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCategoryStatus = async (req, res) => {
  try {
    const { slug } = req.params;
    const { status } = req.body;

    const validStatuses = ["active", "inactive"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const category = await Category.findOneAndUpdate(
      { slug },
      { status },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy category",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái category thành công",
      data: {
        name: category.name,
        slug: category.slug,
        status: category.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  updateCategoryStatus,
};
