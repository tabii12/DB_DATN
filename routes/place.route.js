const express = require("express");
const router = express.Router();

const placeController = require("../controllers/place.controller");

/* ======================================================
   PLACE ROUTES
====================================================== */

// Create place
router.post("/", placeController.createPlace);

// Update place by id
router.put("/:id", placeController.updatePlace);

// Delete place by id
router.delete("/:id", placeController.deletePlace);

module.exports = router;
