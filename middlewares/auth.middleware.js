const jwt = require("jsonwebtoken");
const { User } = require("../models/user.model");

const primaryAuth = async (req, res, next) => {
  try {
    let token;

    /* ========= 1. Lấy token ========= */
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không có token",
      });
    }

    /* ========= 2. Check ENV ========= */
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    /* ========= 3. Verify ========= */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* ========= 4. Lấy user ========= */
    const user = await User.findById(decoded.id).select("-password");
    console.log("Decoded JWT:", decoded);
    console.log("MONGO URI:", process.env.MONGO_URI);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User không tồn tại",
      });
    }

    /* ========= 5. Gắn req ========= */
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn!",
    });
  }
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(); // 👉 không có token vẫn cho qua
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { _id: decoded.id };
  } catch (err) {
    console.log("Token invalid");
  }

  next();
};

module.exports = {
  primaryAuth,
  optionalAuth,
};