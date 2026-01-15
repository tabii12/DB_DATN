const Tour = require("../models/tour.model");
const Image = require("../models/image.model");
const cloudinary = require("../utils/cloudinary");

/* ================= CREATE TOUR ================= */
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

    const newTour = await Tour.create({
      name, // slug sẽ tự sinh
      description,
      price,
      status,
      start_date,
      end_date,
      max_people,
    });

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

/* ================= GET ALL TOURS ================= */
const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find({ status: "active" }).sort({
      createdAt: -1,
    });

    const data = await Promise.all(
      tours.map(async (tour) => {
        const images = await Image.find({ entity_id: tour._id });
        return { ...tour.toObject(), images };
      })
    );

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= GET TOUR BY SLUG ================= */
const getTourBySlug = async (req, res) => {
  try {
    const tour = await Tour.findOne({
      slug: req.params.slug,
      status: "active",
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour không tồn tại",
      });
    }

    const images = await Image.find({ entity_id: tour._id });

    res.status(200).json({
      success: true,
      data: { ...tour.toObject(), images },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= UPDATE TOUR ================= */
const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findOne({ slug: req.params.slug });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour không tồn tại",
      });
    }

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

    // ⚠️ name đổi → slug tự đổi (do mongoose-slug-updater)
    await tour.save();

    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: "pick_your_way/tours",
          })
        )
      );

      await Image.insertMany(
        uploads.map((img) => ({
          entity_id: tour._id,
          image_url: img.secure_url,
          public_id: img.public_id,
        }))
      );
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật tour thành công",
      data: tour,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= DELETE IMAGE ================= */
const deleteTourImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy ảnh",
      });
    }

    await cloudinary.uploader.destroy(image.public_id);
    await Image.findByIdAndDelete(image._id);

    res.status(200).json({
      success: true,
      message: "Xóa ảnh thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= UPDATE STATUS ================= */
const updateTourStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "inactive", "full"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const tour = await Tour.findOneAndUpdate(
      { slug: req.params.slug },
      { status },
      { new: true }
    );

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: tour,
    });
  } catch (error) {
    res.status(500).json({
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
