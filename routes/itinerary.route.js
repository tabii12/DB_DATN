const express = require("express");
const router = express.Router();
const itineraryController = require("../controllers/itinerary.controller");

/* ======================================================
   ITINERARY ROUTES
====================================================== */

router.post("/create", itineraryController.createItinerary);
router.get("/tour/:tourId", itineraryController.getItinerariesByTour);
router.put("/:id", itineraryController.updateItineraryById);
router.delete("/:id", itineraryController.deleteItineraryById);

module.exports = router;
