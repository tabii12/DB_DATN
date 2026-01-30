const express = require("express");
const router = express.Router();
const itineraryController = require("../controllers/itinerary.controller");

/* ======================================================
   ITINERARY ROUTES
====================================================== */

/**
 * @route   GET /api/itineraries/tour/:tourId
 * @desc    Lấy danh sách itinerary theo tour
 */
router.get("/tour/:tourId", itineraryController.getItinerariesByTour);

/**
 * @route   POST /api/itineraries
 * @desc    Tạo itinerary mới
 */
router.post("/create", itineraryController.createItinerary);

/**
 * @route   PATCH /api/itineraries/:slug
 * @desc    Update itinerary theo slug
 */
router.patch("/:slug", itineraryController.updateItineraryBySlug);

/**
 * @route   DELETE /api/itineraries/:slug
 * @desc    Xóa itinerary theo slug
 */
router.delete("/:slug", itineraryController.deleteItineraryBySlug);

module.exports = router;
