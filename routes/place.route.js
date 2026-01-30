const express = require("express");
const router = express.Router();

const placeController = require("../controllers/place.controller");

/* ======================================================
   PLACE ROUTES
====================================================== */

// Create place
router.post("/create", placeController.createPlace);

// Get all places
router.get("/", placeController.getAllPlaces);

// Update place by slug
router.put("/:slug", placeController.updatePlaceBySlug);

// Delete place by slug
router.delete("/:slug", placeController.deletePlaceBySlug);

module.exports = router;
