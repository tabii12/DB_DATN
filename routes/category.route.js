const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");

/* ======================================================
   CATEGORY ROUTES
====================================================== */

// Create category
router.post("/create", categoryController.createCategory);

// Get all categories
// GET /categories
// GET /categories?status=active
router.get("/", categoryController.getAllCategories);

// Get category by slug
router.get("/:slug", categoryController.getCategoryBySlug);

// Update category by slug
router.put("/:slug", categoryController.updateCategory);

// Update category status
router.patch("/:slug/status", categoryController.updateCategoryStatus);

module.exports = router;
