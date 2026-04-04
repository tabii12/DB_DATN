const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");

// CREATE
router.post("/", categoryController.createCategory);

// READ
router.get("/", categoryController.getAllCategories);
router.get("/:slug", categoryController.getCategoryBySlug);

// UPDATE
router.patch("/:slug", categoryController.updateCategory);

module.exports = router;
