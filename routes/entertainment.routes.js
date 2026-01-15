const express = require("express");
const router = express.Router();
const entertainmentController = require("../controllers/entertainment.controller");
const upload = require("../middlewares/multer");

/* ================= CREATE ================= */
/**
 * Tạo mới địa điểm giải trí
 * - Upload tối đa 5 ảnh
 */
router.post(
  "/create",
  upload.array("images", 5),
  entertainmentController.createEntertainment
);

/* ================= GET ================= */
/**
 * Lấy danh sách địa điểm giải trí
 */
router.get("/", entertainmentController.getAllEntertainment);

/**
 * Lấy chi tiết địa điểm giải trí theo slug
 */
router.get("/detail/:slug", entertainmentController.getEntertainmentBySlug);

/* ================= UPDATE ================= */
/**
 * Cập nhật thông tin địa điểm giải trí
 * - Có thể upload thêm ảnh
 */
router.put(
  "/update/:slug",
  upload.array("images", 5),
  entertainmentController.updateEntertainment
);

/* ================= IMAGE ================= */
/**
 * Xóa 1 ảnh của địa điểm giải trí theo imageId
 */
router.delete(
  "/image/:imageId",
  entertainmentController.deleteEntertainmentImages
);

/* ================= STATUS ================= */
/**
 * Cập nhật trạng thái địa điểm giải trí
 * (active / inactive / hidden)
 */
router.patch(
  "/status/:slug",
  entertainmentController.updateEntertainmentStatus
);

module.exports = router;
