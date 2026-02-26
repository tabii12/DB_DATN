const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên người dùng là bắt buộc"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Email không hợp lệ"],
    },

    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      match: [/^[+\d][\d\s-]{7,14}$/, "Số điện thoại không hợp lệ"],
    },

    password: {
      type: String,
      required: false,
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },

    /* ===== EMAIL VERIFY ===== */
    isVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifyCode: {
      type: String,
    },

    emailVerifyExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/* ===== Hash password ===== */
userSchema.pre("save", async function (next) {
  if (!this.password) return next();

  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* ===== Compare password ===== */
userSchema.methods.comparePassword = function (passwordInput) {
  return bcrypt.compare(passwordInput, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = { User };
