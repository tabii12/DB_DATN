var express = require('express');
var router = express.Router();

const { getAllCategories, getCategoryById, createCategory} = require('../controllers/categoryController');

router.get('/', getAllCategories);

router.get('/:id',getCategoryById);

router.post('/create', createCategory);

module.exports = router;
