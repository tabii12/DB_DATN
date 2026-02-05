const express = require("express");
const router = express.Router();

const placeController = require("../controllers/place.controller");
const upload = require("../middlewares/multer");

/* ======================================================
   PLACE ROUTES
====================================================== */

// Create place
router.post("/create", upload.array("images", 10), placeController.createPlace);

// Update place by id
router.put("/:id", upload.array("images", 10), placeController.updatePlace);

// Delete place by id
router.delete("/:id", placeController.deletePlace);

module.exports = router;
