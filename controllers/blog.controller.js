const Blog = require("../models/blog.model");

const createBlog = async (req, res) => {
  try {
    const { title, content, created_by } = req.body;

    const newBlog = new Blog({
      title,
      content,
      created_by,
    });

    await newBlog.save();

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: newBlog,
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
    const blogs = await Blog.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: blogs.length,
      data: blogs,
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
  updateBlogContentBySlug,
  updateBlogStatusBySlug,
  deleteBlogBySlug,
};
