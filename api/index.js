const app = require("../app");
const connectDB = require("../utils/connectDB");

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error("🔥 DB ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "DB connection failed",
    });
  }
};
