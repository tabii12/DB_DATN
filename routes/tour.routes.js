const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const tourController = require("../controllers/tour.controller");

/* ================= CREATE ================= */
/**
 * Tạo tour mới
 * - Upload tối đa 5 ảnh
 */
router.post("/create", upload.array("images", 5), tourController.createTour);

/* ================= GET ================= */
/**
 * Lấy danh sách tour
 */
router.get("/", tourController.getAllTours);

/**
 * Lấy chi tiết tour theo slug
 */
router.get("/detail/:slug", tourController.getTourBySlug);

/* ================= UPDATE ================= */
/**
 * Cập nhật thông tin tour
 * - Có thể upload thêm ảnh
 */
router.put(
  "/update/:slug",
  upload.array("images", 5),
  tourController.updateTour
);

/* ================= IMAGE ================= */
/**
 * Xóa 1 ảnh của tour theo imageId
 */
router.delete("/image/:imageId", tourController.deleteTourImage);

/* ================= STATUS ================= */
/**
 * Cập nhật trạng thái tour
 */
router.patch("/status/:slug", tourController.updateTourStatus);

module.exports = router;
