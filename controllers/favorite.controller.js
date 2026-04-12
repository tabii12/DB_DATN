const Favorite = require("../models/favorite.model");
const Tour = require("../models/tour.model");
const mongoose = require("mongoose");

const toggleFavorite = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { tour_id } = req.body;

    if (!tour_id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tour_id",
      });
    }

    const existed = await Favorite.findOne({
      user_id,
      tour_id: new mongoose.Types.ObjectId(tour_id),
    });

    if (existed) {
      await existed.deleteOne();
      return res.json({
        success: true,
        message: "Đã bỏ yêu thích",
        isFavorite: false,
      });
    }

    await Favorite.create({
      user_id,
      tour_id: new mongoose.Types.ObjectId(tour_id),
    });

    return res.json({
      success: true,
      message: "Đã thêm vào yêu thích",
      isFavorite: true,
    });
  } catch (error) {
    console.error("🔥 ERROR:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Đã tồn tại trong danh sách yêu thích",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyFavorites = async (req, res) => {
  try {
    const user_id = req.user._id;

    const favorites = await Favorite.find({ user_id }).lean();

    const tourIds = favorites.map((f) => f.tour_id);

    const tours = await Tour.find({
      _id: { $in: tourIds },
    })
      .populate("category_id")
      .lean();

    return res.json({
      success: true,
      data: tours,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  toggleFavorite,
  getMyFavorites,
};
