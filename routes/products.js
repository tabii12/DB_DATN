var express = require('express');
var router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const { getAllProducts, getProductById, createProduct } = require('../controllers/productController');

router.get('/', getAllProducts)

router.get('/:id', getProductById)

router.post("/create", upload.single("image"), createProduct);

module.exports = router;
