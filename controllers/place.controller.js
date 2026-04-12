const Place = require("../models/place.model");
const PlaceImage = require("../models/placeImage.model");
const cloudinary = require("../utils/cloudinary");
const { uploadMultipleImages } = require("../utils/cloudinaryUpload");

const createPlace = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu bắt buộc",
      });
    }

    // 1️⃣ Tạo place
    const place = await Place.create({
      title,
      content,
    });

    // 2️⃣ Upload ảnh nếu có
    const uploadedImages = await uploadMultipleImages(
      req.files,
      "pick_your_way/places",
    );

    if (uploadedImages.length) {
      const images = uploadedImages.map((img) => ({
        place_id: place._id,
        ...img,
      }));

      await PlaceImage.insertMany(images);
    }

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

const getAllPlaces = async (req, res) => {
  try {
    // 1️⃣ Lấy tất cả places
    const places = await Place.find().sort({ createdAt: -1 });

    // 2️⃣ Dùng Promise.all để lấy ảnh cho từng place (hoặc dùng aggregate nếu muốn tối ưu hơn)
    const data = await Promise.all(
      places.map(async (place) => {
        const images = await PlaceImage.find({ place_id: place._id });
        return {
          ...place.toObject(),
          images,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      total: data.length,
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPlaceDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa điểm",
      });
    }

    const images = await PlaceImage.find({ place_id: place._id });

    return res.status(200).json({
      success: true,
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

const updatePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, delete_image_ids } = req.body;

    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy place",
      });
    }

    /* ===== 1. Update text ===== */
    if (title !== undefined) place.title = title;
    if (content !== undefined) place.content = content;

    await place.save();

    /* ===== 2. Delete images ===== */
    if (delete_image_ids?.length) {
      // đảm bảo là array (frontend nên gửi array luôn)
      const ids = Array.isArray(delete_image_ids)
        ? delete_image_ids
        : JSON.parse(delete_image_ids);

      const imagesToDelete = await PlaceImage.find({
        _id: { $in: ids },
        place_id: place._id,
      });

      // xoá trên cloudinary song song
      await Promise.all(
        imagesToDelete.map((img) => cloudinary.uploader.destroy(img.public_id)),
      );

      // xoá trong DB
      await PlaceImage.deleteMany({
        _id: { $in: ids },
        place_id: place._id,
      });
    }

    /* ===== 3. Add new images ===== */
    if (req.files?.length) {
      const uploadedImages = await uploadMultipleImages(
        req.files,
        "pick_your_way/places",
      );

      if (uploadedImages.length) {
        await PlaceImage.insertMany(
          uploadedImages.map((img) => ({
            place_id: place._id,
            ...img,
          })),
        );
      }
    }

    /* ===== 4. Return updated data ===== */
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

    const images = await PlaceImage.find({ place_id: place._id });

    // 🔥 Xoá ảnh trên cloudinary
    for (const img of images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    // 🗑️ Xoá DB
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
  getAllPlaces,
  getPlaceDetail,
  updatePlace,
  deletePlace,
};
