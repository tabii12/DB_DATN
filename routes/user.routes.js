const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

/* ================= GET ================= */
/**
 * Lấy danh sách tất cả người dùng (Admin)
 */
router.get("/", userController.getAllUsers);

/* ================= AUTH ================= */
/**
 * Đăng ký tài khoản
 */
router.post("/register", userController.register);

/**
 * Đăng nhập
 */
router.post("/login", userController.login);

/* ================= VERIFY EMAIL ================= */
/**
 * Xác thực email (gửi từ frontend / postman)
 * Body: { email, code }
 */
router.post("/verify-email", userController.verifyEmail);

/**
 * Xác thực email qua link gửi trong email
 */
router.get("/verify-email/:email/:code", userController.verifyEmail);

/* ================= STATUS ================= */
/**
 * Cập nhật trạng thái người dùng (Admin)
 */
router.patch("/status/:id", userController.updateUserStatus);

module.exports = router;
