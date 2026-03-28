const Blog = require("../models/blog.model");
const BlogImage = require("../models/blogImage.model");
const { uploadMultipleImages } = require("../utils/cloudinaryUpload");

const createBlog = async (req, res) => {
  try {
    const { title, content, created_by } = req.body;

    const newBlog = new Blog({ title, content, created_by });

    const uploadedImages = await uploadMultipleImages(
      req.files,
      "pick_your_way/blogs",
    );

    if (uploadedImages.length) {
      const images = uploadedImages.map((img) => ({
        blog_id: newBlog._id,
        ...img,
      }));

      await BlogImage.insertMany(images);
    }

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: newBlog, // slug đã có ở đây
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating blog",
      error: error.message,
    });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).lean();

    const blogIds = blogs.map((t) => t._id);

    const images = await BlogImage.find({
      blog_id: { $in: blogIds },
    }).lean();

    const imageMap = {};
    images.forEach((img) => {
      if (!imageMap[img.blog_id]) imageMap[img.blog_id] = [];
      imageMap[img.blog_id].push(img);
    });

    const result = blogs.map((blog) => ({
      ...blog,
      images: imageMap[blog._id] || [],
    }));

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug không được để trống",
      });
    }

    const blog = await Blog.findOne({ slug }).lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy blog",
      });
    }

    const images = await BlogImage.find({
      blog_id: blog._id,
    }).lean();

    const result = {
      ...blog,
      images,
    };

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBlogContentBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content } = req.body;

    const updateData = {
      ...(title && { title }),
      ...(content && { content }),
    };

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No content to update",
      });
    }

    const blog = await Blog.findOneAndUpdate({ slug }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog content updated successfully",
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBlogStatusBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const blog = await Blog.findOneAndUpdate(
      { slug },
      { status },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog status updated successfully",
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOneAndDelete({ slug });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  updateBlogContentBySlug,
  updateBlogStatusBySlug,
  deleteBlogBySlug,
};
