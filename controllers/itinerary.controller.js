const Itinerary = require("../models/itinerary.model");
const ItineraryDetail = require("../models/itineraryDetail.model");
const PlaceImage = require("../models/placeImage.model");

/* ======================================================
   CREATE ITINERARY (1 ngày trong tour)
====================================================== */
const createItinerary = async (req, res) => {
  try {
    const { tour_id, day_number, title, meal_note } = req.body;

    const itinerary = await Itinerary.create({
      tour_id,
      day_number,
      title,
      meal_note,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo itinerary thành công",
      data: itinerary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   GET ITINERARIES BY TOUR
====================================================== */
const getItinerariesByTour = async (req, res) => {
  try {
    const { tourId } = req.params;

    // 1. Lấy itineraries theo tour
    const itineraries = await Itinerary.find({
      tour_id: tourId,
    })
      .sort({ day_number: 1 })
      .lean();

    // 2. Gắn itinerary_details cho từng itinerary
    for (const itinerary of itineraries) {
      const details = await ItineraryDetail.find({
        itinerary_id: itinerary._id,
      })
        .populate("place_id")
        .sort({ order: 1 })
        .lean();

      // 3. Nếu detail có place → lấy thêm images
      for (const detail of details) {
        if (detail.place_id) {
          const images = await PlaceImage.find({
            place_id: detail.place_id._id,
          }).lean();

          detail.place_id.images = images;
        }
      }

      itinerary.details = details;
    }

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

/* ======================================================
   UPDATE ITINERARY BY ID
====================================================== */
const updateItineraryById = async (req, res) => {
  try {
    const { id } = req.params;

    const itinerary = await Itinerary.findById(id);
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy itinerary",
      });
    }

    const fields = ["day_number", "title", "meal_note", "tour_id"];

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

/* ======================================================
   DELETE ITINERARY BY ID
====================================================== */
const deleteItineraryById = async (req, res) => {
  try {
    const { id } = req.params;

    const itinerary = await Itinerary.findByIdAndDelete(id);
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
  updateItineraryById,
  deleteItineraryById,
};
