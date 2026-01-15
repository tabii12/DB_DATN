/* ================= IMPORT ================= */
const Entertainment = require("../models/entertainment.model");
const Image = require("../models/image.model");
const cloudinary = require("../config/cloudinary");

/* =========================================================
   CREATE
   ========================================================= */
/**
 * @desc    Tạo mới một entertainment và upload ảnh (nếu có)
 * @route   POST /api/entertainments/create
 * @access  Admin
 */
const createEntertainment = async (req, res) => {
  try {
    const { name, location, description, price, available_date, status } =
      req.body;

    // Tạo entertainment
    const newEntertainment = await Entertainment.create({
      name,
      location,
      description,
      price,
      available_date,
      status,
    });

    // Upload ảnh lên Cloudinary (nếu có)
    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: "pick_your_way/entertainments",
          })
        )
      );

      // Lưu thông tin ảnh vào DB
      const images = uploads.map((img) => ({
        entity_id: newEntertainment._id,
        image_url: img.secure_url,
        public_id: img.public_id, // đã chứa folder
      }));

      await Image.insertMany(images);
    }

    return res.status(201).json({
      success: true,
      message: "Tạo entertainment thành công",
      data: newEntertainment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   GET ALL
   ========================================================= */
/**
 * @desc    Lấy danh sách entertainments + filter + ảnh
 * @route   GET /api/entertainments
 * @access  Public
 */
const getAllEntertainments = async (req, res) => {
  try {
    const { location, status, minPrice, maxPrice, fromDate, toDate } =
      req.query;

    /* ================= FILTER ================= */
    const filter = {};

    if (location) filter.location = location;
    if (status) filter.status = status;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (fromDate || toDate) {
      filter.available_date = {};
      if (fromDate) filter.available_date.$gte = new Date(fromDate);
      if (toDate) filter.available_date.$lte = new Date(toDate);
    }

    /* ================= QUERY ================= */
    const entertainments = await Entertainment.find(filter)
      .sort("-createdAt")
      .lean();

    /* ================= ATTACH IMAGES ================= */
    const entertainmentIds = entertainments.map((item) => item._id);

    const images = await Image.find({
      entity_id: { $in: entertainmentIds },
    }).lean();

    // Gom ảnh theo entity_id
    const imageMap = {};
    images.forEach((img) => {
      if (!imageMap[img.entity_id]) imageMap[img.entity_id] = [];
      imageMap[img.entity_id].push(img);
    });

    const result = entertainments.map((item) => ({
      ...item,
      images: imageMap[item._id] || [],
    }));

    return res.status(200).json({
      success: true,
      results: result.length,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   GET DETAIL
   ========================================================= */
/**
 * @desc    Lấy chi tiết entertainment theo slug
 * @route   GET /api/entertainments/detail/:slug
 * @access  Public
 */
const getEntertainmentBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const entertainment = await Entertainment.findOne({ slug }).lean();

    if (!entertainment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy entertainment",
      });
    }

    const images = await Image.find({
      entity_id: entertainment._id,
    }).lean();

    return res.status(200).json({
      success: true,
      data: {
        ...entertainment,
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

/* =========================================================
   UPDATE
   ========================================================= */
/**
 * @desc    Cập nhật thông tin entertainment + thêm / xóa ảnh
 * @route   PUT /api/entertainments/update/:slug
 * @access  Admin
 */
const updateEntertainment = async (req, res) => {
  try {
    const { slug } = req.params;

    const {
      name,
      location,
      description,
      price,
      available_date,
      status,
      removeImageIds,
    } = req.body;

    const entertainment = await Entertainment.findOne({ slug });

    if (!entertainment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy entertainment",
      });
    }

    /* ================= UPDATE INFO ================= */
    if (name !== undefined) entertainment.name = name;
    if (location !== undefined) entertainment.location = location;
    if (description !== undefined) entertainment.description = description;
    if (price !== undefined) entertainment.price = price;
    if (available_date !== undefined)
      entertainment.available_date = available_date;
    if (status !== undefined) entertainment.status = status;

    await entertainment.save();

    /* ================= REMOVE IMAGES ================= */
    if (removeImageIds?.length) {
      const imagesToRemove = await Image.find({
        _id: { $in: removeImageIds },
        entity_id: entertainment._id,
      });

      await Promise.all(
        imagesToRemove.map((img) => cloudinary.uploader.destroy(img.public_id))
      );

      await Image.deleteMany({
        _id: { $in: removeImageIds },
        entity_id: entertainment._id,
      });
    }

    /* ================= ADD NEW IMAGES ================= */
    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: "pick_your_way/entertainments",
          })
        )
      );

      const images = uploads.map((img) => ({
        entity_id: entertainment._id,
        image_url: img.secure_url,
        public_id: img.public_id,
      }));

      await Image.insertMany(images);
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật entertainment thành công",
      data: {
        name: entertainment.name,
        slug: entertainment.slug,
        status: entertainment.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   IMAGE
   ========================================================= */
/**
 * @desc    Xóa 1 ảnh của entertainment
 * @route   DELETE /api/entertainments/image/:imageId
 * @access  Admin
 */
const deleteEntertainmentImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy ảnh",
      });
    }

    await cloudinary.uploader.destroy(image.public_id);
    await Image.findByIdAndDelete(imageId);

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

/* =========================================================
   STATUS
   ========================================================= */
/**
 * @desc    Thay đổi trạng thái entertainment
 * @route   PATCH /api/entertainments/status/:slug
 * @access  Admin
 */
const updateEntertainmentStatus = async (req, res) => {
  try {
    const { slug } = req.params;
    const { status } = req.body;

    const validStatuses = ["available", "sold_out", "inactive"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Trạng thái không hợp lệ. Chỉ chấp nhận: available, sold_out, inactive",
      });
    }

    const entertainment = await Entertainment.findOneAndUpdate(
      { slug },
      { status },
      { new: true, runValidators: true }
    );

    if (!entertainment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy entertainment để cập nhật",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Đã thay đổi trạng thái entertainment thành: ${status}`,
      data: {
        name: entertainment.name,
        slug: entertainment.slug,
        status: entertainment.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống: " + error.message,
    });
  }
};

/* ================= EXPORT ================= */
module.exports = {
  createEntertainment,
  getAllEntertainments,
  getEntertainmentBySlug,
  updateEntertainment,
  deleteEntertainmentImage,
  updateEntertainmentStatus,
};
