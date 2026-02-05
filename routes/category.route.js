const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");

router.post("/create", categoryController.createCategory);

router.get("/", categoryController.getAllCategories);

router.get("/:slug", categoryController.getCategoryBySlug);

router.put("/:slug", categoryController.updateCategory);

router.patch("/:slug/status", categoryController.updateCategoryStatus);

module.exports = router;
