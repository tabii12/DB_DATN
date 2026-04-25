const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/booking.controller");
const isAdmin = require("../middlewares/isAdmin.middleware");
const { primaryAuth } = require("../middlewares/auth.middleware");

router.use(primaryAuth); // Tất cả các route bên dưới đều cần Login

// Tạo mới booking
router.post("/", bookingController.createBooking);

// Lấy danh sách booking của chính user đó
router.get("/my-bookings", bookingController.getMyBookings);

// Route kiểm tra nhanh việc đã đặt tour hay chưa
router.get("/check-booked/:tourId", bookingController.checkUserHasBooked);

router.patch("/detail/:id/status", bookingController.updateBookingStatus);

router.post("/update-payment", bookingController.updatePayment);

router.use(isAdmin);

// Lấy toàn bộ booking hệ thống (kèm thông tin Service)
router.get("/admin/all", bookingController.getAllBookings);

// Báo cáo tình trạng lấp đầy các Trip (Để admin quyết định khởi hành/hủy)
router.get("/admin/status-report", bookingController.getTripStatusReport);

// Admin cập nhật trạng thái đơn hàng (Confirm thanh toán, Hủy đơn, xác nhận...)
router.patch("/admin/:id/status", bookingController.updateBookingStatus);

module.exports = router;
