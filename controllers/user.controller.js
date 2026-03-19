const { User } = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    /* ===== Check email tồn tại ===== */
    const existedUser = await User.findOne({ email });
    if (existedUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    /* ===== Tạo mã xác thực (OTP 6 số) ===== */
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    /* ===== Thời gian hết hạn: 10 phút ===== */
    const verifyExpire = Date.now() + 10 * 60 * 1000;

    /* ===== Tạo user ===== */
    const user = await User.create({
      name,
      email,
      password,
      emailVerifyCode: verifyCode,
      emailVerifyExpire: verifyExpire,
      isVerified: false,
    });

    /* ===== Gửi email xác thực ===== */
    const verifyUrl = `https://db-datn-six.vercel.app/api/users/verify-email/${email}/${verifyCode}`;

    await sendEmail({
      to: email,
      subject: "Xác nhận đăng ký Pick Your Way",
      html: `
        <h2>Xin chào ${name} 👋</h2>
        <p>Cảm ơn bạn đã đăng ký. Vui lòng nhấn vào nút bên dưới để xác thực tài khoản:</p>
        <a href="${verifyUrl}"
          style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          XÁC THỰC TÀI KHOẢN
        </a>
        <p>Link có hiệu lực trong 10 phút.</p>
      `,
    });

    console.log("🔥 VERIFY CODE:", verifyCode);

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công, vui lòng kiểm tra email để xác nhận",
    });
  } catch (error) {
    console.error("🔥 Register Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    /* ===== Nhận dữ liệu từ body hoặc params ===== */
    const email = req.body?.email || req.params?.email;
    const code = req.body?.code || req.params?.code;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Thiếu email hoặc mã xác thực",
      });
    }

    /* ===== Tìm user ===== */
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    /* ===== Kiểm tra đã xác thực chưa ===== */
    if (user.isVerified) {
      return res
        .status(400)
        .send("<h1>Tài khoản đã được xác thực trước đó.</h1>");
    }

    /* ===== Kiểm tra hết hạn ===== */
    if (user.emailVerifyExpire < Date.now()) {
      return res.status(400).send("<h1>Mã xác thực đã hết hạn.</h1>");
    }

    /* ===== Kiểm tra mã OTP ===== */
    if (user.emailVerifyCode !== code) {
      return res.status(400).send("<h1>Mã xác thực không chính xác.</h1>");
    }

    /* ===== Cập nhật trạng thái xác thực ===== */
    user.isVerified = true;
    user.emailVerifyCode = undefined;
    user.emailVerifyExpire = undefined;
    await user.save();

    /* ===== Trả HTML nếu verify qua link ===== */
    if (req.params.code) {
      return res.status(200).send(`
        <div style="text-align:center;padding:50px;font-family:Arial">
          <h1 style="color:#2ecc71">✅ Xác thực thành công!</h1>
          <p>Tài khoản của bạn đã được kích hoạt.</p>
        </div>
      `);
    }

    return res.json({
      success: true,
      message: "Xác thực email thành công",
    });
  } catch (error) {
    console.error("🔥 VerifyEmail Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    /* ===== Tìm user ===== */
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email không tồn tại",
      });
    }

    /* ===== Kiểm tra đã verify chưa ===== */
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản chưa được xác thực email",
      });
    }

    /* ===== So sánh mật khẩu ===== */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu không chính xác",
      });
    }

    /* ===== Tạo JWT ===== */
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("LOGIN SECRET:", process.env.JWT_SECRET);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("🔥 Login Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Thiếu Google token",
      });
    }

    // ===== Verify token với Google =====
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Không lấy được email từ Google",
      });
    }

    // ===== Check user tồn tại =====
    let user = await User.findOne({ email });

    if (!user) {
      // ===== Nếu chưa có thì tạo mới =====
      user = await User.create({
        name,
        email,
        password: null,
        isVerified: true, // Google auto verified
      });
    }

    // ===== Tạo JWT =====
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      message: "Đăng nhập Google thành công",
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("🔥 Google Auth Error:", error);
    return res.status(401).json({
      success: false,
      message: "Xác thực Google thất bại",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["active", "inactive", "blocked"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ (active | inactive | blocked)",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái người dùng thành công",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại và mới không được để trống",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    const isMatch = await bcrupt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại không chính xác",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrupt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  googleAuth,
  getAllUsers,
  updateUserStatus,
  getUserById,
  changePassword,
};
