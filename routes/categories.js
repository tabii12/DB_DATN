var express = require('express');
var router = express.Router();

const { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory} = require('../controllers/categoryController');

router.get('/', getAllCategories);

router.get('/:id',getCategoryById);

router.post('/create', createCategory);

// router.put('/update/:id', updateCategory);

// router.delete('/delete/:id', deleteCategory);

module.exports = router;
