const isAdmin = (req, res, next) => {
  try {
    // req.user đã được gắn từ middleware protect
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập (Admin only)",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = isAdmin;
