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
    const { type, year, month, day, hour } = req.query;

    const now = new Date();
    const targetYear = parseInt(year) || now.getFullYear();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const targetDay = parseInt(day) || now.getDate();

    let startDate, endDate;

    if (type === "hour") {
      // Lọc chính xác 1 giờ cụ thể của 1 ngày cụ thể
      const targetHour = parseInt(hour) || 0;
      startDate = new Date(
        `${targetYear}-${targetMonth}-${targetDay}T${targetHour}:00:00+07:00`,
      );
      endDate = new Date(
        `${targetYear}-${targetMonth}-${targetDay}T${targetHour}:59:59+07:00`,
      );
    } else if (type === "day") {
      // Lọc chính xác 1 ngày cụ thể
      startDate = new Date(
        `${targetYear}-${targetMonth}-${targetDay}T00:00:00+07:00`,
      );
      endDate = new Date(
        `${targetYear}-${targetMonth}-${targetDay}T23:59:59+07:00`,
      );
    } else if (type === "month") {
      // Lọc chính xác 1 tháng cụ thể
      startDate = new Date(`${targetYear}-${targetMonth}-01T00:00:00+07:00`);
      // Ngày 0 của tháng sau chính là ngày cuối của tháng hiện tại
      endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
    }

    // Thực hiện đếm số lượng bản ghi trong khoảng thời gian xác định
    const count = await LoginHistory.countDocuments({
      login_time: { $gte: startDate, $lte: endDate },
    });

    return res.status(200).json({
      success: true,
      filter: {
        type,
        selection: {
          year: targetYear,
          month: targetMonth,
          day: type !== "month" ? targetDay : undefined,
          hour: type === "hour" ? parseInt(hour) : undefined,
        },
      },
      total_logins: count,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllLoginHistory,
  getLoginStats,
};
