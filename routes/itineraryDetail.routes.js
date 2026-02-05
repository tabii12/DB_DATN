const express = require("express");
const router = express.Router();

const itineraryDetailController = require("../controllers/itineraryDetail.controller");

router.post("/create", itineraryDetailController.createItineraryDetail);

router.get(
  "/itinerary/:itineraryId",
  itineraryDetailController.getDetailsByItinerary,
);

router.put("/:id", itineraryDetailController.updateItineraryDetail);

router.delete("/:id", itineraryDetailController.deleteItineraryDetail);

module.exports = router;
