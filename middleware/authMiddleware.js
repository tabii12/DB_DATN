const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");

      req.user = await User.findById(decoded.id).select("-MatKhau");

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: "Token không hợp lệ!" });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Không có token, truy cập bị từ chối!" });
  }
};

module.exports = { 
    protect 
};
