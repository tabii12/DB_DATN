var express = require('express');
var router = express.Router();

const { getAllProducts, getProductById, createProduct } = require('../controllers/productController');

router.get('/', getAllProducts)

router.get('/:id', getProductById)

router.post('/', createProduct);

module.exports = router;
