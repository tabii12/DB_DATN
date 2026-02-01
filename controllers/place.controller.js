const Place = require("../models/place.model");
const PlaceImage = require("../models/placeImage.model");

/* ======================================================
   CREATE PLACE
====================================================== */
const createPlace = async (req, res) => {
  try {
    const { title, content, images = [] } = req.body;

    // 1. Tạo place
    const place = await Place.create({
      title,
      content,
    });

    // 2. Tạo images nếu có
    let placeImages = [];
    if (images.length > 0) {
      placeImages = await PlaceImage.insertMany(
        images.map((img) => ({
          place_id: place._id,
          image_url: img.image_url,
          public_id: img.public_id,
        })),
      );
    }

    return res.status(201).json({
      success: true,
      message: "Tạo place thành công",
      data: {
        ...place.toObject(),
        images: placeImages,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   UPDATE PLACE
====================================================== */
const updatePlace = async (req, res) => {
  try {
    const { id } = req.params;

    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy place",
      });
    }

    ["title", "content"].forEach((field) => {
      if (req.body[field] !== undefined) {
        place[field] = req.body[field];
      }
    });

    await place.save();

    const images = await PlaceImage.find({ place_id: place._id });

    return res.status(200).json({
      success: true,
      message: "Cập nhật place thành công",
      data: {
        ...place.toObject(),
        images,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   DELETE PLACE
====================================================== */
const deletePlace = async (req, res) => {
  try {
    const { id } = req.params;

    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy place",
      });
    }

    // ❗ Không check service ở đây
    // Service không gắn trực tiếp với place

    await PlaceImage.deleteMany({ place_id: place._id });
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
  updatePlace,
  deletePlace,
};
