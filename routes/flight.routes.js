const express = require("express");
const router = express.Router();
const flightController = require("../controllers/flight.controller");
const upload = require("../middlewares/multer");

router.post(
  "/create",
  upload.array("images", 5),
  flightController.createFlight
);

router.get("/", flightController.getAllFlights);

router.get("/detail/:code", flightController.getFlightByCode);

router.put("/update/:code", upload.array("images", 5), flightController.updateFlightByCode);

router.delete("/image/:imageId", flightController.deleteFlightImage);

router.patch("/status/:code", flightController.updateFlightStatus);

module.exports = router;
