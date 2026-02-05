const express = require("express");
const router = express.Router();

const placeController = require("../controllers/place.controller");
const upload = require("../middlewares/multer");

router.post("/create", upload.array("images", 10), placeController.createPlace);

router.put("/:id", upload.array("images", 10), placeController.updatePlace);

router.delete("/:id", placeController.deletePlace);

module.exports = router;
