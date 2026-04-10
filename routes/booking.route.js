const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/booking.controller");
const isAdmin = require("../middlewares/isAdmin.middleware");
const { primaryAuth } = require("../middlewares/auth.middleware");

// Admin routes
router.get("/admin/all", primaryAuth, isAdmin, bookingController.getAllBookings);
router.patch("/admin/:id/confirm-payment", primaryAuth, isAdmin, bookingController.confirmPayment);

// VNPAY callback
router.get("/vnpay/callback", bookingController.updateVNPayPayment);

// User routes
router.post("/", primaryAuth, bookingController.createBooking);
router.get("/my-bookings", primaryAuth, bookingController.getMyBookings);

router.get("/detail/:id", primaryAuth, bookingController.getBookingDetail);
router.patch("/detail/:id/cancel", primaryAuth, bookingController.cancelBooking);

module.exports = router;
