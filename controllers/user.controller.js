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
    const verifyUrl = `http://localhost:3000/api/users/verify-email/${email}/${verifyCode}`;

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
        <p>Hoặc nhập mã thủ công: <b>${verifyCode}</b></p>
        <p>Link này có hiệu lực trong 10 phút.</p>
      `,
    });

    console.log("-----------------------------------------");
    console.log("🔥 MÃ XÁC NHẬN CỦA BẠN LÀ:", verifyCode);
    console.log("-----------------------------------------");

    // 6. Trả về
    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công, vui lòng kiểm tra email để xác nhận",
    });
  } catch (error) {
    console.error("🔥 LỖI CHI TIẾT:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===== VERIFY EMAIL ===== */
const verifyEmail = async (req, res) => {
  try {
    // 1. Lấy dữ liệu an toàn từ cả Body và Params
    const email = req.body?.email || req.params?.email;
    const code = req.body?.code || req.params?.code;

    // 2. Kiểm tra nếu không có email hoặc code thì dừng lại ngay, tránh lỗi crash
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy thông tin email hoặc mã xác thực trong yêu cầu."
      });
    }

    // 3. Tìm người dùng
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại trên hệ thống."
      });
    }

    // 4. Kiểm tra nếu đã xác thực rồi
    if (user.isVerified) {
      return res.status(400).send("<h1>Tài khoản này đã được xác thực trước đó.</h1>");
    }

    // 5. Kiểm tra mã xác thực
    if (user.emailVerifyCode !== code) {
      return res.status(400).send("<h1>Mã xác thực không chính xác hoặc đã bị thay đổi.</h1>");
    }

    // 6. Kiểm tra hết hạn
    if (user.emailVerifyExpire < Date.now()) {
      return res.status(400).send("<h1>Mã xác thực đã hết hạn (hiệu lực 10 phút).</h1>");
    }

    // 7. Cập nhật trạng thái thành công
    user.isVerified = true;
    user.emailVerifyCode = undefined;
    user.emailVerifyExpire = undefined;
    await user.save();

    // 8. Phản hồi dựa trên cách người dùng truy cập
    if (req.params.code) {
      // Nếu nhấn từ link email, trả về giao diện HTML
      return res.send(`
        <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
          <h1 style="color: #2ecc71;">✅ Xác thực thành công!</h1>
          <p>Tài khoản của bạn đã được kích hoạt. Bây giờ bạn có thể đăng nhập vào hệ thống.</p>
        </div>
      `);
    }

    // Nếu gọi từ Postman/Frontend, trả về JSON
    return res.json({
      success: true,
      message: "Xác thực email thành công",
    });

  } catch (error) {
    console.error("🔥 Lỗi Verify chi tiết:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi hệ thống: " + error.message
    });
  }
};

module.exports = {
  register,
  verifyEmail,
};
