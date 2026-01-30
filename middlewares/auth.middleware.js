const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

/* ================= AUTH PROTECT MIDDLEWARE ================= */
/**
 * Middleware bảo vệ route
 * - Kiểm tra JWT token từ header Authorization
 * - Giải mã token
 * - Gắn thông tin user vào req.user
 */
const protect = async (req, res, next) => {
  let token;

  try {
    /* ========= 1. Lấy token từ Header ========= */
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    /* ========= 2. Nếu không có token ========= */
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không có token, truy cập bị từ chối!",
      });
    }

    /* ========= 3. Giải mã token ========= */
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");

    /* ========= 4. Lấy thông tin user từ DB ========= */
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    /* ========= 5. Gắn user vào request ========= */
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn!",
    });
  }
};

module.exports = protect;