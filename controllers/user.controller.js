const { User } = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check email tồn tại
    const existedUser = await User.findOne({ email });
    if (existedUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    // 2. Tạo mã xác nhận (OTP 6 số)
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Thời gian hết hạn (10 phút)
    const verifyExpire = Date.now() + 10 * 60 * 1000;

    // 4. Tạo user
    const user = await User.create({
      name,
      email,
      password,
      emailVerifyCode: verifyCode,
      emailVerifyExpire: verifyExpire,
      isVerified: false,
    });

    // 5. GỬI EMAIL XÁC NHẬN 
    await sendEmail({
      to: email,
      subject: "Xác nhận đăng ký Pick Your Way",
      html: `
        <h2>Xin chào ${name} 👋</h2>
        <p>Cảm ơn bạn đã đăng ký Pick Your Way.</p>
        <p>Mã xác nhận của bạn là:</p>
        <h1 style="letter-spacing: 4px;">${verifyCode}</h1>
        <p>Mã có hiệu lực trong <b>10 phút</b>.</p>
        <p>Nếu không phải bạn đăng ký, vui lòng bỏ qua email này.</p>
      `,
    });

    // 6. Trả về
    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công, vui lòng kiểm tra email để xác nhận",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===== VERIFY EMAIL ===== */
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Tài khoản đã được xác thực",
      });
    }

    if (user.emailVerifyCode !== code) {
      return res.status(400).json({
        success: false,
        message: "Mã xác nhận không đúng",
      });
    }

    if (user.emailVerifyExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Mã xác nhận đã hết hạn",
      });
    }

    user.isVerified = true;
    user.emailVerifyCode = undefined;
    user.emailVerifyExpire = undefined;
    await user.save();

    return res.json({
      success: true,
      message: "Xác thực email thành công",
    });
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
};