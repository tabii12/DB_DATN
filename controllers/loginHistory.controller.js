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

      // Tạo mốc thời gian theo UTC bằng cách trừ đi 7 tiếng (múi giờ VN)
      // Date.UTC(year, monthIndex, day, hour, minute, second)
      startDate = new Date(
        Date.UTC(targetYear, targetMonth - 1, targetDay, targetHour - 7, 0, 0),
      );
      endDate = new Date(
        Date.UTC(
          targetYear,
          targetMonth - 1,
          targetDay,
          targetHour - 7,
          59,
          59,
        ),
      );
    } else if (type === "day") {
      // Lọc cả ngày VN (từ 00h sáng VN đến 23h59 VN) -> quy đổi sang UTC
      startDate = new Date(
        Date.UTC(targetYear, targetMonth - 1, targetDay, 0 - 7, 0, 0),
      );
      endDate = new Date(
        Date.UTC(targetYear, targetMonth - 1, targetDay, 23 - 7, 59, 59),
      );
    } else if (type === "month") {
      startDate = new Date(
        Date.UTC(targetYear, targetMonth - 1, 1, 0 - 7, 0, 0),
      );
      endDate = new Date(Date.UTC(targetYear, targetMonth, 0, 23 - 7, 59, 59));
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
