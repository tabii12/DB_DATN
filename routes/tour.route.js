const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const tourController = require("../controllers/tour.controller");
const { optionalAuth } = require("../middlewares/auth.middleware");

router.post("/create", tourController.createTour);

router.post(
  "/upload-images/:slug",
  upload.array("images", 5),
  tourController.uploadTourImages,
);

router.get("/", tourController.getAllTours);

router.get("/admin", tourController.getAllToursAdmin);

router.get("/detail/:slug", optionalAuth, tourController.getTourBySlug);

router.put("/update/:slug", tourController.updateTour);

router.delete("/image/:imageId", tourController.deleteTourImage);

router.patch("/status/:slug", tourController.updateTourStatus);

module.exports = router;
