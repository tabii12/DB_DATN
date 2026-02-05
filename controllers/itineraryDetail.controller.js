const ItineraryDetail = require("../models/itineraryDetail.model");

const createItineraryDetail = async (req, res) => {
  try {
    const { itinerary_id, place_id, type, title, content, order } = req.body;

    const detail = await ItineraryDetail.create({
      itinerary_id,
      place_id,
      type,
      title,
      content,
      order,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo itinerary detail thành công",
      data: detail,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDetailsByItinerary = async (req, res) => {
  try {
    const { itineraryId } = req.params;

    const details = await ItineraryDetail.find({
      itinerary_id: itineraryId,
    })
      .populate("place_id")
      .sort({ order: 1 });

    return res.status(200).json({
      success: true,
      total: details.length,
      data: details,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateItineraryDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const detail = await ItineraryDetail.findById(id);
    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy itinerary detail",
      });
    }

    const fields = ["place_id", "type", "title", "content", "order"];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        detail[field] = req.body[field];
      }
    });

    await detail.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật itinerary detail thành công",
      data: detail,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteItineraryDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const detail = await ItineraryDetail.findByIdAndDelete(id);
    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy itinerary detail",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xoá itinerary detail thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createItineraryDetail,
  getDetailsByItinerary,
  updateItineraryDetail,
  deleteItineraryDetail,
};
