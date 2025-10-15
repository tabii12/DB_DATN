const express = require("express");
const router = express.Router();
const multer = require("multer"); 
const upload = multer({ dest: "uploads/" });

const { getAllBrands, getBrandById, createBrand } = require("../controllers/brandController");

router.get("/", getAllBrands);
router.get("/:id", getBrandById);

router.post("/create", upload.single("Logo"), createBrand);

module.exports = router;
