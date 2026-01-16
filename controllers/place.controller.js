const Place = require("../models/place.model");
const Service = require("../models/service.model");

/* ======================================================
   CREATE PLACE
====================================================== */
const createPlace = async (req, res) => {
  try {
    const { title, content } = req.body;

    const place = await Place.create({
      title,
      content,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo place thành công",
      data: place,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   GET ALL PLACES
====================================================== */
const getAllPlaces = async (req, res) => {
  try {
    const places = await Place.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: places.length,
      data: places,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   UPDATE PLACE BY SLUG
====================================================== */
const updatePlaceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const place = await Place.findOne({ slug });
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy place",
      });
    }

    const fields = ["title", "content"];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        place[field] = req.body[field];
      }
    });

    await place.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật place thành công",
      data: place,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   DELETE PLACE BY SLUG
   - Không cho xoá nếu còn service đang dùng place
====================================================== */
const deletePlaceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const place = await Place.findOne({ slug });
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy place",
      });
    }

    // Check service đang dùng place
    const serviceCount = await Service.countDocuments({
      place_id: place._id,
    });

    if (serviceCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Không thể xoá place vì vẫn còn service đang sử dụng",
      });
    }

    await Place.findByIdAndDelete(place._id);

    return res.status(200).json({
      success: true,
      message: "Xoá place thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPlace,
  getAllPlaces,
  updatePlaceBySlug,
  deletePlaceBySlug,
};
