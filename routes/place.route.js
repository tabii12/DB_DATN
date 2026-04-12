const express = require("express");
const router = express.Router();

const placeController = require("../controllers/place.controller");
const isAdmin = require("../middlewares/isAdmin.middleware");
const { primaryAuth } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer");

router.get("/", placeController.getAllPlaces);
router.get("/:id", placeController.getPlaceDetail);


router.use(primaryAuth);
router.use(isAdmin);

// Tạo mới địa điểm (Dùng POST)
router.post("/", upload.array("images", 10), placeController.createPlace);

// Cập nhật địa điểm (Nên dùng PATCH vì bạn chỉ update một phần dữ liệu)
router.patch("/:id", upload.array("images", 10), placeController.updatePlace);

// Xoá địa điểm (Dùng DELETE)
router.delete("/:id", placeController.deletePlace);

module.exports = router;