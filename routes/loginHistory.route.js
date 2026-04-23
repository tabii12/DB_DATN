const express = require("express");
const router = express.Router();
const loginHistoryController = require("../controllers/loginHistory.controller");
const isAdmin = require("../middlewares/isAdmin.middleware");
const { primaryAuth } = require("../middlewares/auth.middleware");

router.use(primaryAuth);
router.use(isAdmin);

// Route lấy toàn bộ lịch sử (có thể dùng cho table)
router.get("/all", loginHistoryController.getAllLoginHistory);

// Route lấy thống kê số lượng (có thể dùng cho biểu đồ)
// Truy vấn: /api/login-history/stats?type=hour hoặc ?type=month
router.get("/stats", loginHistoryController.getLoginStats);

module.exports = router;