const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/booking.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");

// ================= USER =================

// Tạo booking
router.post("/", authMiddleware, bookingController.createBooking);

// Lấy danh sách booking của chính mình
router.get("/my-bookings", authMiddleware, bookingController.getMyBookings);

// Lấy chi tiết 1 booking
router.get("/:id", authMiddleware, bookingController.getBookingDetail);

// Huỷ booking
router.patch("/:id/cancel", authMiddleware, bookingController.cancelBooking);

// ================= ADMIN =================

// Lấy tất cả booking
router.get(
  "/admin/all",
  authMiddleware,
  isAdmin,
  bookingController.getAllBookings,
);

// Admin xác nhận thanh toán
router.patch(
  "/admin/:id/confirm-payment",
  authMiddleware,
  isAdmin,
  bookingController.confirmPayment,
);

module.exports = router;
