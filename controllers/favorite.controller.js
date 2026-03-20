const Favorite = require("../models/favorite.model");
const Tour = require("../models/tour.model");

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
    console.error("🔥 ERROR:", err);
    
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

module.exports = { toggleFavorite };
