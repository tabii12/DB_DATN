const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    HoTen: {
      type: String,
      required: [true, "Họ tên là bắt buộc"],
      trim: true,
    },
    Email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Email không hợp lệ"],
    },
    SDT: {
      type: String,
      required: [true, "Số điện thoại là bắt buộc"],
      unique: true,
      trim: true,
      match: [/^[+\d][\d\s-]{7,14}$/, "SĐT không hợp lệ"],
    },
    MatKhau: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
    },
    QuyenHang: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("MatKhau")) return next();

    const salt = await bcrypt.genSalt(10);
    this.MatKhau = await bcrypt.hash(this.MatKhau, salt); 
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (matkhauNhap) {
  return await bcrypt.compare(matkhauNhap, this.MatKhau);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = { User };