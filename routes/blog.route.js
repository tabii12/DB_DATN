const express = require("express");
const router = express.Router();

const blogController = require("../controllers/blog.controller");

// Create blog
router.post("/create", blogController.createBlog);

// Get all blogs
router.get("/", blogController.getAllBlogs);

// Update blog content (title, content)
router.patch("/:slug/content", blogController.updateBlogContentBySlug);

// Update blog status
router.patch("/:slug/status", blogController.updateBlogStatusBySlug);

// Delete blog
router.delete("/:slug", blogController.deleteBlogBySlug);

module.exports = router;
