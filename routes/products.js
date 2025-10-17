var express = require('express');
var router = express.Router();
const multer = require("multer");
const fs = require("fs");

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const upload = multer({ dest: "uploads/" });

const { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');

router.get('/', getAllProducts);

router.get('/:id', getProductById);

router.post("/", upload.array("image", 5), createProduct);

router.put("/:id", upload.array("image", 5), updateProduct);

router.delete("/:id", deleteProduct);

module.exports = router;
