const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const multer = require("multer");
const upload = multer({ dest: uploadDir });

const {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} = require("../controllers/brandController");

router.get("/", getAllBrands);

router.get("/:id", getBrandById);

router.post("/", upload.single("Logo"), createBrand);

router.put("/:id", upload.single("Logo"), updateBrand);

router.delete("/:id", deleteBrand);

module.exports = router;
