const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const tourController = require("../controllers/tour.controller");

router.post("/", upload.array("images", 5), tourController.createTour);
router.get("/", tourController.getAllTours);
router.get("/:slug", tourController.getTourBySlug);
router.patch("/status/:slug", tourController.updateTourStatus);
router.put("/:slug", upload.array("images", 5), tourController.updateTour);
router.delete("/image/:imageId", tourController.deleteTourImage);

module.exports = router;
