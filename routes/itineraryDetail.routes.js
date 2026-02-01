const express = require("express");
const router = express.Router();

const itineraryDetailController = require("../controllers/itineraryDetail.controller");

/* ======================================================
   ITINERARY DETAIL ROUTES
====================================================== */

// Create itinerary detail
router.post("/", itineraryDetailController.createItineraryDetail);

// Get details by itinerary
router.get(
  "/itinerary/:itineraryId",
  itineraryDetailController.getDetailsByItinerary,
);

// Update itinerary detail
router.put("/:id", itineraryDetailController.updateItineraryDetail);

// Delete itinerary detail
router.delete("/:id", itineraryDetailController.deleteItineraryDetail);

module.exports = router;
