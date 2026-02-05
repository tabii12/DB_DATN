const express = require("express");
const router = express.Router();

const itineraryServiceController = require("../controllers/itineraryService.controller");

router.post("/create", itineraryServiceController.createItineraryService);

router.get(
  "/itinerary/:itineraryId",
  itineraryServiceController.getServicesByItinerary,
);

router.put("/:id", itineraryServiceController.updateItineraryService);

router.delete("/:id", itineraryServiceController.deleteItineraryService);

module.exports = router;
