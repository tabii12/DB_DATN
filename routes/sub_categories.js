var express = require('express');
var router = express.Router();

const { getAllSubCategories, getSubCategoryById, createSubCategory, updateSubCategory, deleteSubCategory } = require('../controllers/sub_categoryController');

router.get('/', getAllSubCategories); //Lấy tất cả danh mục con

router.get('/:id', getSubCategoryById); //Lấy chi tiết 1 danh mục con

router.get('/create', createSubCategory); //Tạo mới 1 danh mục con

router.get('/update/:id', updateSubCategory); //Cập nhật 1 danh mục con

router.get('/delete/:id', deleteSubCategory); //Xóa 1 danh mục con

module.exports = router;