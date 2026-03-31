const Blog = require("../models/blog.model");
const BlogImage = require("../models/blogImage.model");
const { uploadMultipleImages } = require("../utils/cloudinaryUpload");
const slugify = require("slugify");
const cloudinary = require("cloudinary").v2;

// CREATE BLOG
const createBlog = async (req, res) => {
  try {
    const { title, content, created_by } = req.body;

    if (!title || !content || !created_by) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu bắt buộc",
      });
    }

    const slug = slugify(title, { lower: true, strict: true });

    const newBlog = await Blog.create({
      title,
      slug,
      content,
      created_by,
    });

    if (req.files?.length) {
      const uploadedImages = await uploadMultipleImages(
        req.files,
        "pick_your_way/blogs",
      );

      const images = uploadedImages.map((img) => ({
        blog_id: newBlog._id,
        ...img,
      }));

      await BlogImage.insertMany(images);
    }

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: newBlog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL BLOGS
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).lean();

    const blogIds = blogs.map((b) => b._id);

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

// GET BLOG BY SLUG
const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

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

    return res.status(200).json({
      success: true,
      data: {
        ...blog,
        images,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE BLOG
const updateBlogContentBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content } = req.body;

    const updateData = {
      ...(title && { title }),
      ...(content && { content }),
    };

    if (title) {
      updateData.slug = slugify(title, { lower: true, strict: true });
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

    if (req.files?.length) {
      const uploadedImages = await uploadMultipleImages(
        req.files,
        "pick_your_way/blogs",
      );

      const images = uploadedImages.map((img) => ({
        blog_id: blog._id,
        ...img,
      }));

      await BlogImage.insertMany(images);
    }

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE STATUS
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
      { new: true, runValidators: true },
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated",
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE BLOG
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

    await BlogImage.deleteMany({ blog_id: blog._id });

    return res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE IMAGE
const deleteBlogImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await BlogImage.findById(imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy ảnh",
      });
    }

    await cloudinary.uploader.destroy(image.public_id);
    await BlogImage.findByIdAndDelete(imageId);

    return res.status(200).json({
      success: true,
      message: "Xóa ảnh thành công",
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
  deleteBlogImage,
};
