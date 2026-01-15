const express = require("express");
const router = express.Router();
const flightController = require("../controllers/flight.controller");
const upload = require("../middlewares/multer");

/* ================= CREATE ================= */
/**
 * Tạo chuyến bay mới
 * - Upload tối đa 5 ảnh
 */
router.post(
  "/create",
  upload.array("images", 5),
  flightController.createFlight
);

/* ================= GET ================= */
/**
 * Lấy danh sách chuyến bay
 */
router.get("/", flightController.getAllFlights);

/**
 * Lấy chi tiết chuyến bay theo mã code
 */
router.get("/detail/:code", flightController.getFlightByCode);

/* ================= UPDATE ================= */
/**
 * Cập nhật thông tin chuyến bay
 * - Có thể upload thêm ảnh
 */
router.put(
  "/update/:code",
  upload.array("images", 5),
  flightController.updateFlightByCode
);

/* ================= IMAGE ================= */
/**
 * Xóa 1 ảnh của chuyến bay theo imageId
 */
router.delete("/image/:imageId", flightController.deleteFlightImage);

/* ================= STATUS ================= */
/**
 * Cập nhật trạng thái chuyến bay
 */
router.patch("/status/:code", flightController.updateFlightStatus);

module.exports = router;
