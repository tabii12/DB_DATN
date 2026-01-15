const Hotel = require("../models/hotel.model");
const Image = require("../models/image.model");
const cloudinary = require("../utils/cloudinary");

/* ======================================================
   CREATE HOTEL
   - Tạo khách sạn mới
   - Upload ảnh (nếu có)
====================================================== */
const createHotel = async (req, res) => {
  try {
    const { name, address, city, description, price_per_night, status } =
      req.body;

    /* ===== Tạo khách sạn ===== */
    const newHotel = await Hotel.create({
      name,
      address,
      city,
      description,
      price_per_night,
      status,
    });

    /* ===== Upload images (nếu có) ===== */
    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: "pick_your_way/hotels",
          })
        )
      );

      const images = uploads.map((img) => ({
        entity_id: newHotel._id,
        image_url: img.secure_url,
        public_id: img.public_id,
      }));

      await Image.insertMany(images);
    }

    return res.status(201).json({
      success: true,
      message: "Tạo khách sạn thành công",
      data: newHotel,
    });
  } catch (error) {
    console.error("🔥 CreateHotel Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   GET ALL HOTELS
   - Lấy danh sách khách sạn đang active
   - Gắn images cho từng khách sạn
====================================================== */
const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ status: "active" })
      .sort({ createdAt: -1 })
      .lean();

    /* ===== Gắn images ===== */
    const hotelIds = hotels.map((hotel) => hotel._id);

    const images = await Image.find({
      entity_id: { $in: hotelIds },
    }).lean();

    const imageMap = {};
    images.forEach((img) => {
      if (!imageMap[img.entity_id]) {
        imageMap[img.entity_id] = [];
      }
      imageMap[img.entity_id].push(img);
    });

    const result = hotels.map((hotel) => ({
      ...hotel,
      images: imageMap[hotel._id] || [],
    }));

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("🔥 GetAllHotels Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   GET HOTEL BY SLUG
   - Tìm khách sạn theo slug
   - Gắn images
====================================================== */
const getHotelBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const hotel = await Hotel.findOne({
      slug,
      status: "active",
    }).lean();

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khách sạn",
      });
    }

    const images = await Image.find({
      entity_id: hotel._id,
    }).lean();

    return res.status(200).json({
      success: true,
      data: {
        ...hotel,
        images,
      },
    });
  } catch (error) {
    console.error("🔥 GetHotelBySlug Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   UPDATE HOTEL BY SLUG
   - Update thông tin khách sạn
   - Upload thêm ảnh (nếu có)
====================================================== */
const updateHotel = async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, address, city, description, price_per_night, status } =
      req.body;

    const hotel = await Hotel.findOne({ slug });
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khách sạn",
      });
    }

    /* ===== Update data ===== */
    hotel.name = name ?? hotel.name;
    hotel.address = address ?? hotel.address;
    hotel.city = city ?? hotel.city;
    hotel.description = description ?? hotel.description;
    hotel.price_per_night = price_per_night ?? hotel.price_per_night;
    hotel.status = status ?? hotel.status;

    await hotel.save();

    /* ===== Upload images mới ===== */
    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: "pick_your_way/hotels",
          })
        )
      );

      const images = uploads.map((img) => ({
        entity_id: hotel._id,
        image_url: img.secure_url,
        public_id: img.public_id,
      }));

      await Image.insertMany(images);
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật khách sạn thành công",
      data: hotel,
    });
  } catch (error) {
    console.error("🔥 UpdateHotel Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   DELETE HOTEL IMAGE
   - Xóa ảnh theo imageId
   - Xóa Cloudinary + Database
====================================================== */
const deleteHotelImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy ảnh",
      });
    }

    await cloudinary.uploader.destroy(image.public_id);
    await Image.findByIdAndDelete(imageId);

    return res.status(200).json({
      success: true,
      message: "Xóa ảnh thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   UPDATE HOTEL STATUS
   - Chỉ update trạng thái khách sạn
====================================================== */
const updateHotelStatus = async (req, res) => {
  try {
    const { slug } = req.params;
    const { status } = req.body;

    const validStatuses = ["active", "inactive", "hidden"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ (active | inactive | hidden)",
      });
    }

    const hotel = await Hotel.findOneAndUpdate(
      { slug },
      { status },
      { new: true, runValidators: true }
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khách sạn",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: {
        name: hotel.name,
        slug: hotel.slug,
        status: hotel.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createHotel,
  getAllHotels,
  getHotelBySlug,
  updateHotel,
  deleteHotelImage,
  updateHotelStatus,
};
