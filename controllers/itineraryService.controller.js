const ItineraryService = require("../models/itineraryService.model");

/* ======================================================
   CREATE – thêm service vào itinerary
====================================================== */
const createItineraryService = async (req, res) => {
  try {
    const { itinerary_id, service_id, quantity } = req.body;

    const item = await ItineraryService.create({
      itinerary_id,
      service_id,
      quantity,
    });

    return res.status(201).json({
      success: true,
      message: "Thêm service vào itinerary thành công",
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   GET – lấy service theo itinerary
====================================================== */
const getServicesByItinerary = async (req, res) => {
  try {
    const { itineraryId } = req.params;

    const services = await ItineraryService.find({
      itinerary_id: itineraryId,
    })
      .populate({
        path: "service_id",
        select: "name description price place_id",
        populate: {
          path: "place_id",
          select: "title content",
        },
      })
      .lean();

    const result = services.map((item) => ({
      ...item,
      total_price: item.service_id.price * item.quantity,
    }));

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   UPDATE – cập nhật quantity
====================================================== */
const updateItineraryService = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const item = await ItineraryService.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy itinerary service",
      });
    }

    if (quantity !== undefined) {
      item.quantity = quantity;
    }

    await item.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật itinerary service thành công",
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   DELETE – xóa service khỏi itinerary
====================================================== */
const deleteItineraryService = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await ItineraryService.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy itinerary service",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa service khỏi itinerary thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createItineraryService,
  getServicesByItinerary,
  updateItineraryService,
  deleteItineraryService,
};
