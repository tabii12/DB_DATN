const { User } = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

const verifyEmail = async (req, res) => {
  try {
    // 1. Lấy dữ liệu an toàn từ cả Body và Params
    const email = req.body?.email || req.params?.email;
    const code = req.body?.code || req.params?.code;

    // 2. Kiểm tra nếu không có email hoặc code thì dừng lại ngay, tránh lỗi crash
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message:
          "Không tìm thấy thông tin email hoặc mã xác thực trong yêu cầu.",
      });
    }

    // 3. Tìm người dùng
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại trên hệ thống.",
      });
    }

    // 4. Kiểm tra nếu đã xác thực rồi
    if (user.isVerified) {
      return res
        .status(400)
        .send("<h1>Tài khoản này đã được xác thực trước đó.</h1>");
    }

    // 5. Kiểm tra mã xác thực
    if (user.emailVerifyCode !== code) {
      return res
        .status(400)
        .send("<h1>Mã xác thực không chính xác hoặc đã bị thay đổi.</h1>");
    }

    // 6. Kiểm tra hết hạn
    if (user.emailVerifyExpire < Date.now()) {
      return res
        .status(400)
        .send("<h1>Mã xác thực đã hết hạn (hiệu lực 10 phút).</h1>");
    }

    // 7. Cập nhật trạng thái thành công
    user.isVerified = true;
    user.emailVerifyCode = undefined;
    user.emailVerifyExpire = undefined;
    await user.save();

    // 8. Phản hồi dựa trên cách người dùng truy cập
    if (req.params.code) {
      return res.status(200).send(`
        <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            <h1 style="color: #2ecc71;">✅ Xác thực thành công!</h1>
            <p>Tài khoản của bạn đã được kích hoạt.</p>
            <script>
                // Tự động chuyển hướng về trang login sau 3 giây (nếu có frontend)
                // setTimeout(() => { window.location.href = "http://localhost:3000/login" }, 3000);
            </script>
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
      message: "Đã xảy ra lỗi hệ thống: " + error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Kiểm tra input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ email và mật khẩu",
      });
    }

    // 2. Tìm người dùng và lấy luôn cả trường password (nếu bạn dùng select: false trong model)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email không tồn tại trên hệ thống",
      });
    }

    // 3. QUAN TRỌNG: Kiểm tra xem user đã xác thực email chưa
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message:
          "Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email!",
      });
    }

    // 4. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu không chính xác",
      });
    }

    // 5. Tạo JWT Token (Nếu bạn dùng cơ chế Token)
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "1d" }
    );

    // 6. Trả về thành công
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
    console.error("🔥 Lỗi Login:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống: " + error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Lấy tất cả user, loại bỏ mật khẩu, sắp xếp người mới nhất lên đầu
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống: " + error.message,
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Kiểm tra status có nằm trong enum ["active", "inactive", "blocked"] không
    const validStatuses = ["active", "inactive", "blocked"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ. Chỉ chấp nhận: active, inactive, blocked",
      });
    }

    // Cập nhật trạng thái dựa trên ID
    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng này",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Đã thay đổi trạng thái người dùng sang: ${status}`,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống: " + error.message,
    });
  }
};



module.exports = {
  register,
  verifyEmail,
  login,
  getAllUsers,
  updateUserStatus,
};
