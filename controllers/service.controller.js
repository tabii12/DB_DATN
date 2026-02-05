const Service = require("../models/service.model");

const createService = async (req, res) => {
  try {
    const { name, description, price } = req.body;

    const service = await Service.create({
      name,
      description,
      price,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo service thành công",
      data: service,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy service",
      });
    }

    return res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy service",
      });
    }

    const fields = ["name", "description", "price"];

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

const deleteServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndDelete(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy service",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa service thành công",
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
  getServiceById,
  updateServiceById,
  deleteServiceById,
};
