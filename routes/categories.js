var express = require('express');
var router = express.Router();

const { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory} = require('../controllers/categoryController');

//Lấy tất cả danh mục
router.get('/', getAllCategories);

//Lấy chi tiết 1 danh mục
router.get('/:id',getCategoryById);

router.post('/create', createCategory);

router.put('/update/:id', updateCategory);

router.delete('/delete/:id', deleteCategory);

module.exports = router;
