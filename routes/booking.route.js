const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/booking.controller");
const isAdmin = require("../middlewares/isAdmin.middleware");
const { primaryAuth } = require("../middlewares/auth.middleware");

// Auth routes
router.post("/", primaryAuth, bookingController.createBooking);
router.get("/my-bookings", primaryAuth, bookingController.getMyBookings);
router.get("/:id", primaryAuth, bookingController.getBookingDetail);
router.patch("/:id/cancel", primaryAuth, bookingController.cancelBooking);

// Admin routes
router.get("/admin/all", primaryAuth, isAdmin, bookingController.getAllBookings);
router.patch("/admin/:id/confirm-payment", primaryAuth, isAdmin, bookingController.confirmPayment);

// VNPAY callback (public - from VNPAY redirect)
router.get("/vnpay/callback", bookingController.updateVNPayPayment);

module.exports = router;
