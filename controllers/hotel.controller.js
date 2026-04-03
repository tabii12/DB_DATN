const Hotel = require("../models/hotel.model");

const createHotel = async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      description,
      price_per_night,
      rating,
      status,
    } = req.body;

    const newHotel = await Hotel.create({
      name,
      address,
      city,
      description,
      price_per_night,
      rating,
      status,
    });

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

const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ status: "active" }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels,
    });
  } catch (error) {
    console.error("🔥 GetAllHotels Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getHotelBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const hotel = await Hotel.findOne({
      slug,
      status: "active",
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khách sạn",
      });
    }

    return res.status(200).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    console.error("🔥 GetHotelBySlug Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateHotel = async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      name,
      address,
      city,
      description,
      price_per_night,
      rating,
      status,
    } = req.body;

    const hotel = await Hotel.findOne({ slug });
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khách sạn",
      });
    }

    hotel.name = name ?? hotel.name;
    hotel.address = address ?? hotel.address;
    hotel.city = city ?? hotel.city;
    hotel.description = description ?? hotel.description;
    hotel.price_per_night = price_per_night ?? hotel.price_per_night;
    hotel.rating = rating ?? hotel.rating;
    hotel.status = status ?? hotel.status;

    await hotel.save();

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
      { new: true, runValidators: true },
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
    console.error("🔥 UpdateHotelStatus Error:", error);
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
  updateHotelStatus,
};
