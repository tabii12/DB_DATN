const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home.controller");
const upload = require("../middlewares/multer");

// ===== HOME =====
router.get("/", homeController.getHome);

// ===== BANNERS =====
router.post("/banners", upload.array("images", 10), homeController.addBanner);

router.patch(
  "/banners/:banner_id",
  upload.array("images", 10),
  homeController.updateBanner,
);

router.delete("/banners/:banner_id", homeController.deleteBanner);

// ===== COMBOS =====
router.post("/combos", upload.array("images", 5), homeController.addCombo);

router.patch(
  "/combos/:combo_id",
  upload.array("images", 5),
  homeController.updateCombo,
);

router.delete("/combos/:combo_id", homeController.deleteCombo);

// ===== STYLES =====
router.post("/styles", upload.array("images", 5), homeController.addStyle);

router.patch(
  "/styles/:style_id",
  upload.array("images", 5),
  homeController.updateStyle,
);

router.delete("/styles/:style_id", homeController.deleteStyle);

// ===== DESTINATIONS =====
router.post(
  "/destinations",
  upload.array("images", 5),
  homeController.addDestination,
);

router.patch(
  "/destinations/:destination_id",
  upload.array("images", 5),
  homeController.updateDestination,
);

router.delete(
  "/destinations/:destination_id",
  homeController.deleteDestination,
);

module.exports = router;
