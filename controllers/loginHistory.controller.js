const LoginHistory = require("../models/loginHistory.model");

const getAllLoginHistory = async (req, res) => {
  try {
    const history = await LoginHistory.find()
      .populate("user_id", "name email")
      .sort({ login_time: -1 });

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error("🔥 Get History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy lịch sử đăng nhập",
      error: error.message,
    });
  }
};

const getLoginStats = async (req, res) => {
  try {
    const { type } = req.query; // 'day', 'month', 'hour'
    let groupBy = {};

    if (type === "hour") {
      groupBy = { $hour: "$login_time" };
    } else if (type === "month") {
      groupBy = { $month: "$login_time" };
    } else {
      // Mặc định là theo ngày
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$login_time" } };
    }

    const stats = await LoginHistory.aggregate([
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllLoginHistory,
  getLoginStats,
};
