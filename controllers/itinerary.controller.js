const Itinerary = require("../models/itinerary.model");

const createItinerary = async (req, res) => {
  try {
    const { name, date, service_id, tour_id } = req.body;

    const newItinerary = await Itinerary.create({
      name,
      date,
      service_id,
      tour_id,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo lịch trình thành công",
      data: newItinerary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getItinerariesByTour = async (req, res) => {
  try {
    const { tourId } = req.params;

    const itineraries = await Itinerary.find({ tour: tourId })
      .sort({ date: 1 })
      .populate({
        path: "service_id",
        select: "name description price slug place_id",
        populate: {
          path: "place_id",
          select: "title content",
        },
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: itineraries.length,
      data: itineraries,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateItineraryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const itinerary = await Itinerary.findOne({ slug });
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy itinerary",
      });
    }

    /* ===== Fields được phép update ===== */
    const fields = ["date", "name", "service_id", "tour_id"];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        itinerary[field] = req.body[field];
      }
    });

    await itinerary.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật itinerary thành công",
      data: itinerary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteItineraryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const itinerary = await Itinerary.findOneAndDelete({ slug });

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy itinerary",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa itinerary thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createItinerary,
  getItinerariesByTour,
  updateItineraryBySlug,
  deleteItineraryBySlug,
};
