const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/booking.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");

router.post("/create", authMiddleware, bookingController.createBooking);

router.get("/my-bookings", authMiddleware, bookingController.getMyBookings);

router.get("/:id", authMiddleware, bookingController.getBookingDetail);

router.patch("/:id/cancel", authMiddleware, bookingController.cancelBooking);

router.get(
  "/admin/all",
  authMiddleware,
  isAdmin,
  bookingController.getAllBookings,
);

router.patch(
  "/admin/:id/confirm-payment",
  authMiddleware,
  isAdmin,
  bookingController.confirmPayment,
);

module.exports = router;
