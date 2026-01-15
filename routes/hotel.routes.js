const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const hotelController = require("../controllers/hotel.controller");

/* ================= CREATE ================= */
/**
 * Tạo khách sạn mới
 * - Upload tối đa 5 ảnh
 */
router.post("/create", upload.array("images", 5), hotelController.createHotel);

/* ================= GET ================= */
/**
 * Lấy danh sách khách sạn
 */
router.get("/", hotelController.getAllHotels);

/**
 * Lấy chi tiết khách sạn theo slug
 */
router.get("/detail/:slug", hotelController.getHotelBySlug);

/* ================= UPDATE ================= */
/**
 * Cập nhật thông tin khách sạn
 * - Có thể upload thêm ảnh
 */
router.put(
  "/update/:slug",
  upload.array("images", 5),
  hotelController.updateHotel
);

/* ================= IMAGE ================= */
/**
 * Xóa 1 ảnh của khách sạn theo imageId
 */
router.delete("/image/:imageId", hotelController.deleteHotelImage);

/* ================= STATUS ================= */
/**
 * Cập nhật trạng thái khách sạn
 */
router.patch("/status/:slug", hotelController.updateHotelStatus);

module.exports = router;
