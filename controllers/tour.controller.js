const Tour = require("../models/tour.model");
const Image = require("../models/image.model");
const cloudinary = require("../utils/cloudinary");

/* ======================================================
   CREATE TOUR
   - Tạo tour mới
   - Upload ảnh (nếu có)
====================================================== */
const createTour = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      status,
      start_date,
      end_date,
      max_people,
    } = req.body;

    /* ===== Create tour ===== */
    const newTour = await Tour.create({
      name,
      description,
      price,
      status,
      start_date,
      end_date,
      max_people,
    });

    /* ===== Upload images (nếu có) ===== */
    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: "pick_your_way/tours",
          })
        )
      );

      const images = uploads.map((img) => ({
        entity_id: newTour._id,
        image_url: img.secure_url,
        public_id: img.public_id,
      }));

      await Image.insertMany(images);
    }

    return res.status(201).json({
      success: true,
      message: "Tạo tour thành công",
      data: newTour,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   GET ALL TOURS
   - Chỉ lấy tour đang active
   - Gắn images cho từng tour
====================================================== */
const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find({ status: "active" })
      .sort({ createdAt: -1 })
      .lean();

    /* ===== Attach images ===== */
    const tourIds = tours.map((tour) => tour._id);

    const images = await Image.find({
      entity_id: { $in: tourIds },
    }).lean();

    const imageMap = {};
    images.forEach((img) => {
      if (!imageMap[img.entity_id]) {
        imageMap[img.entity_id] = [];
      }
      imageMap[img.entity_id].push(img);
    });

    const result = tours.map((tour) => ({
      ...tour,
      images: imageMap[tour._id] || [],
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

/* ======================================================
   GET TOUR BY SLUG
   - Tìm tour theo slug
   - Chỉ lấy tour đang active
====================================================== */
const getTourBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const tour = await Tour.findOne({
      slug,
      status: "active",
    }).lean();

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tour",
      });
    }

    const images = await Image.find({
      entity_id: tour._id,
    }).lean();

    return res.status(200).json({
      success: true,
      data: {
        ...tour,
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

/* ======================================================
   UPDATE TOUR BY SLUG
   - Update thông tin tour
   - Upload thêm ảnh (nếu có)
====================================================== */
const updateTour = async (req, res) => {
  try {
    const { slug } = req.params;

    const tour = await Tour.findOne({ slug });
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tour",
      });
    }

    /* ===== Update fields ===== */
    const fields = [
      "name",
      "description",
      "price",
      "status",
      "start_date",
      "end_date",
      "max_people",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        tour[field] = req.body[field];
      }
    });

    await tour.save();

    /* ===== Upload new images ===== */
    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: "pick_your_way/tours",
          })
        )
      );

      const images = uploads.map((img) => ({
        entity_id: tour._id,
        image_url: img.secure_url,
        public_id: img.public_id,
      }));

      await Image.insertMany(images);
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật tour thành công",
      data: tour,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   DELETE TOUR IMAGE
   - Xóa ảnh theo imageId
   - Xóa Cloudinary + Database
====================================================== */
const deleteTourImage = async (req, res) => {
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

/* ======================================================
   UPDATE TOUR STATUS
   - Chỉ update trạng thái tour
====================================================== */
const updateTourStatus = async (req, res) => {
  try {
    const { slug } = req.params;
    const { status } = req.body;

    const validStatuses = ["active", "inactive", "full"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const tour = await Tour.findOneAndUpdate(
      { slug },
      { status },
      { new: true, runValidators: true }
    );

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tour",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái tour thành công",
      data: {
        name: tour.name,
        slug: tour.slug,
        status: tour.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTour,
  getAllTours,
  getTourBySlug,
  updateTour,
  deleteTourImage,
  updateTourStatus,
};
