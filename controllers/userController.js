const { User } = require("../models/User");
const generateToken = require("../utils/generateToken");

const createUser = async (req, res) => {
  try {
    const { HoTen, Email, SDT, DiaChi, MatKhau } = req.body;

    if (!HoTen || !Email || !SDT || !MatKhau) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ Họ tên, Email, SĐT và Mật khẩu",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ Email }, { SDT }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc SĐT đã được sử dụng",
      });
    }

    const newUser = await User.create({
      HoTen,
      Email,
      SDT,
      DiaChi,
      MatKhau,
      QuyenHang: "user", // mặc định là user
    });

    const userResponse = newUser.toObject();
    delete userResponse.MatKhau;

    res.status(201).json({
      success: true,
      message: "Tạo tài khoản thành công",
      data: userResponse,
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo tài khoản:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { Email, MatKhau } = req.body;

    if (!Email || !MatKhau) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ Email và Mật khẩu",
      });
    }

    const user = await User.findOne({ Email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email không tồn tại trong hệ thống",
      });
    }

    const isMatch = await user.comparePassword(MatKhau);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu không đúng",
      });
    }

    const token = generateToken(user._id, user.QuyenHang);

    const userResponse = user.toObject();
    delete userResponse.MatKhau;

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      data: userResponse,
    });
  } catch (error) {
    console.error("❌ Lỗi khi đăng nhập:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
      error: error.message,
    });
  }
};

module.exports = {
  createUser,
  loginUser,
};
