const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const tourController = require("../controllers/tour.controller");

router.post("/create", upload.array("images", 5), tourController.createTour);

router.get("/", tourController.getAllTours);

router.get("/detail/:slug", tourController.getTourBySlug);

router.put(
  "/update/:slug",
  upload.array("images", 5),
  tourController.updateTour
);

router.delete("/image/:imageId", tourController.deleteTourImage);

router.patch("/status/:slug", tourController.updateTourStatus);

module.exports = router;
