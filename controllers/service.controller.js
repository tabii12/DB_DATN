const Service = require("../models/service.model");
const Itinerary = require("../models/itinerary.model");

const createService = async (req, res) => {
  try {
    const { name, description, price, place_id } = req.body;

    // 1. Validate cơ bản
    if (!name || !price || !place_id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu bắt buộc (name, price, place_id)",
      });
    }

    // 2. Tạo service
    const service = await Service.create({
      name,
      description,
      price,
      place_id,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo service thành công",
      data: service,
    });
  } catch (error) {
    // Trường hợp trùng slug
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Service đã tồn tại (trùng slug)",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate("place_id", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: services.length,
      data: services,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateServiceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const service = await Service.findOne({ slug });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy service",
      });
    }

    const fields = ["name", "description", "price", "place_id"];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        service[field] = req.body[field];
      }
    });

    await service.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật service thành công",
      data: service,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteServiceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const service = await Service.findOne({ slug });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy service",
      });
    }

    // Check service có đang nằm trong itinerary không
    const usedInItinerary = await Itinerary.exists({
      services: service._id,
    });

    if (usedInItinerary) {
      return res.status(400).json({
        success: false,
        message: "Không thể xoá service vì đang được sử dụng trong itinerary",
      });
    }

    await Service.findByIdAndDelete(service._id);

    return res.status(200).json({
      success: true,
      message: "Xoá service thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createService,
  getAllServices,
  updateServiceBySlug,
  deleteServiceBySlug,
};