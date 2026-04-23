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
    const { type, year, month, day } = req.query; // Chỉ nhận type, year, month, day

    const now = new Date();
    const targetYear = parseInt(year) || now.getFullYear();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const targetDay = parseInt(day) || now.getDate();

    let startDate, endDate;

    if (type === "day") {
      // Lọc chính xác 1 ngày (từ 00:00:00 đến 23:59:59 giờ VN)
      // Trừ 7 để đưa về đúng mốc UTC trong Database
      startDate = new Date(
        Date.UTC(targetYear, targetMonth - 1, targetDay, 0 - 7, 0, 0),
      );
      endDate = new Date(
        Date.UTC(targetYear, targetMonth - 1, targetDay, 23 - 7, 59, 59, 999),
      );
    } else if (type === "month") {
      // Lọc chính xác toàn bộ 1 tháng (từ ngày 1 đến ngày cuối cùng của tháng đó)
      startDate = new Date(
        Date.UTC(targetYear, targetMonth - 1, 1, 0 - 7, 0, 0),
      );
      // Tham số ngày là 0 sẽ trả về ngày cuối cùng của tháng trước đó (kết hợp targetMonth giúp lấy đúng ngày cuối tháng này)
      endDate = new Date(
        Date.UTC(targetYear, targetMonth, 0, 23 - 7, 59, 59, 999),
      );
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Type phải là 'day' hoặc 'month'" });
    }

    // Đếm số bản ghi trong khoảng thời gian đã tính toán
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
          day: type === "day" ? targetDay : undefined,
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
