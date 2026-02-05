const express = require("express");
const router = express.Router();

const blogController = require("../controllers/blog.controller");

router.post("/create", blogController.createBlog);

router.get("/", blogController.getAllBlogs);

router.patch("/:slug/content", blogController.updateBlogContentBySlug);

router.patch("/:slug/status", blogController.updateBlogStatusBySlug);

router.delete("/:slug", blogController.deleteBlogBySlug);

module.exports = router;
