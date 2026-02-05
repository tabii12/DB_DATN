const Place = require("../models/place.model");
const PlaceImage = require("../models/placeImage.model");
const cloudinary = require("../utils/cloudinary");

const createPlace = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu bắt buộc",
      });
    }

    // 1. Tạo place
    const place = await Place.create({
      title,
      content,
    });

    /* ===== Upload images ===== */
    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: "pick_your_way/places",
          }),
        ),
      );

      const images = uploads.map((img) => ({
        place_id: place._id,
        image_url: img.secure_url,
        public_id: img.public_id,
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

    /* ===== Update text ===== */
    if (title !== undefined) place.title = title;
    if (content !== undefined) place.content = content;
    await place.save();

    /* ===== Delete images ===== */
    if (delete_image_ids) {
      const ids = JSON.parse(delete_image_ids);

      const imagesToDelete = await PlaceImage.find({
        _id: { $in: ids },
        place_id: place._id,
      });

      for (const img of imagesToDelete) {
        await cloudinary.uploader.destroy(img.public_id);
      }

      await PlaceImage.deleteMany({ _id: { $in: ids } });
    }

    /* ===== Add new images ===== */
    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: "pick_your_way/places",
          }),
        ),
      );

      await PlaceImage.insertMany(
        uploads.map((img) => ({
          place_id: place._id,
          image_url: img.secure_url,
          public_id: img.public_id,
        })),
      );
    }

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
  updatePlace,
  deletePlace,
};
