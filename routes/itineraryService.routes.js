const express = require("express");
const router = express.Router();

const itineraryServiceController = require("../controllers/itineraryService.controller");

/* ======================================================
   ITINERARY SERVICE ROUTES
====================================================== */

// Thêm service vào itinerary
router.post("/", itineraryServiceController.createItineraryService);

// Lấy danh sách service theo itinerary
router.get(
  "/itinerary/:itineraryId",
  itineraryServiceController.getServicesByItinerary,
);

// Cập nhật quantity service trong itinerary
router.put("/:id", itineraryServiceController.updateItineraryService);

// Xóa service khỏi itinerary
router.delete("/:id", itineraryServiceController.deleteItineraryService);

module.exports = router;
