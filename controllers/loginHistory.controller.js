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
    // Chuyển về kiểu Number để đảm bảo tính toán chính xác
    const targetYear = parseInt(year) || now.getFullYear();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const targetDay = parseInt(day) || now.getDate();

    let startDate, endDate;

    if (type === "hour") {
      const targetHour = parseInt(hour) || 0;
      // Lưu ý: Month trong JS tính từ 0-11, nên phải -1
      // Chúng ta sẽ tạo ngày theo giờ địa phương, sau đó trừ đi 7 tiếng để ra đúng mốc UTC trong DB
      startDate = new Date(
        targetYear,
        targetMonth - 1,
        targetDay,
        targetHour,
        0,
        0,
      );
      endDate = new Date(
        targetYear,
        targetMonth - 1,
        targetDay,
        targetHour,
        59,
        59,
      );
    } else if (type === "day") {
      startDate = new Date(targetYear, targetMonth - 1, targetDay, 0, 0, 0);
      endDate = new Date(targetYear, targetMonth - 1, targetDay, 23, 59, 59);
    } else if (type === "month") {
      startDate = new Date(targetYear, targetMonth - 1, 1, 0, 0, 0);
      // Ngày 0 của tháng sau là ngày cuối cùng của tháng này
      endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
    }

    // Kiểm tra nếu Date không hợp lệ trước khi truy vấn
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Thông số ngày tháng không hợp lệ" });
    }

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
    console.error("🔥 Stats Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllLoginHistory,
  getLoginStats,
};
