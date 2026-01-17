const express = require("express");
const router = express.Router();
const tripController = require("../controllers/trip.controller");

router.post("/create", tripController.createTrip);
router.get("/", tripController.getAllTrips);
router.get("/tour/:slug", tripController.getTripsByTourSlug);
router.put("/:id", tripController.updateTripById);
router.delete("/:id", tripController.deleteTripById);

module.exports = router;
