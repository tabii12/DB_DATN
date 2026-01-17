const Description = require("../models/description.model");

// CREATE DESCRIPTION
const createDescription = async (req, res) => {
  try {
    const { title, content, tour_id } = req.body;

    // Validate dữ liệu bắt buộc
    if (!title || !content || !tour_id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu bắt buộc",
      });
    }

    const description = await Description.create({
      title,
      content,
      tour_id,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo mô tả thành công",
      data: description,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi tạo mô tả",
    });
  }
};

// GET ALL DESCRIPTION BY TOUR
const getDescriptionsByTour = async (req, res) => {
  try {
    const { tour_id } = req.params;

    const descriptions = await Description.find({ tour_id })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: descriptions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy mô tả theo tour",
    });
  }
};

// UPDATE DESCRIPTION BY ID
const updateDescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedDescription = await Description.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedDescription) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mô tả",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật mô tả thành công",
      data: updatedDescription,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật mô tả",
    });
  }
};

// DELETE DESCRIPTION BY ID
const deleteDescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDescription = await Description.findByIdAndDelete(id);

    if (!deletedDescription) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mô tả",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa mô tả thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi xóa mô tả",
    });
  }
};

module.exports = {
  createDescription,
  getDescriptionsByTour,
  updateDescriptionById,
  deleteDescriptionById,
};
