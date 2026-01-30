const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotel.controller");

/* ================= CREATE ================= */
/**
 * Tạo khách sạn mới
 */
router.post("/create", hotelController.createHotel);

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
 */
router.put("/update/:slug", hotelController.updateHotel);

/* ================= STATUS ================= */
/**
 * Cập nhật trạng thái khách sạn
 */
router.patch("/status/:slug", hotelController.updateHotelStatus);

module.exports = router;
