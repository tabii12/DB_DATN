const Service = require("../models/service.model");

// 1. CREATE SERVICE
const createService = async (req, res) => {
  try {
    const { serviceName, type, basePrice, unit, description } = req.body;

    if (!serviceName || !type || basePrice === undefined || !unit) {
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng nhập đầy đủ các trường bắt buộc (Tên, Loại, Giá gốc, Đơn vị)",
      });
    }

    const newService = await Service.create({
      serviceName,
      type,
      basePrice,
      unit,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Thêm dịch vụ vào kho thành công",
      data: newService,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. GET ALL SERVICES (Có hỗ trợ lọc theo type)
const getAllServices = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type, status: "active" } : { status: "active" };

    const services = await Service.find(filter).sort({ createdAt: -1 }).lean();

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

// 3. GET SERVICE BY ID
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).lean();

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dịch vụ",
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

// 4. UPDATE SERVICE
const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dịch vụ để cập nhật",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật dịch vụ thành công",
      data: service,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 5. DELETE SERVICE
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Dịch vụ không tồn tại",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Đã xóa dịch vụ khỏi kho",
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
  updateService,
  deleteService,
};
