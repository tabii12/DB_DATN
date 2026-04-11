const Tour = require("../models/tour.model");
const TourImage = require("../models/tourImage.model");
const Description = require("../models/description.model");
const Comment = require("../models/comment.model");
const Itinerary = require("../models/itinerary.model");
const ItineraryDetail = require("../models/itineraryDetail.model");
const PlaceImage = require("../models/placeImage.model");
const Trip = require("../models/trip.model");
const Favorite = require("../models/favorite.model");

const cloudinary = require("../utils/cloudinary");
const { uploadMultipleImages } = require("../utils/cloudinaryUpload");

const slugify = require("slugify");

const createTour = async (req, res) => {
  try {
    const { name, hotel_id, category_id, start_location } = req.body;

    if (!name || !hotel_id || !category_id || !start_location) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu bắt buộc",
      });
    }

    const slug = slugify(name, {
      lower: true,
      strict: true,
    });

    const newTour = await Tour.create({
      name,
      slug,
      hotel_id,
      category_id,
      start_location,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo tour thành công",
      data: newTour,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const uploadTourImages = async (req, res) => {
  try {
    const { slug } = req.params;

    const tour = await Tour.findOne({ slug });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tour",
      });
    }

    const uploadedImages = await uploadMultipleImages(
      req.files,
      "pick_your_way/tours",
    );

    if (!uploadedImages.length) {
      return res.status(400).json({
        success: false,
        message: "Không có ảnh upload",
      });
    }

    const images = uploadedImages.map((img) => ({
      tour_id: tour._id,
      ...img,
    }));

    await TourImage.insertMany(images);

    return res.status(201).json({
      success: true,
      message: "Upload ảnh thành công",
      data: images,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find({ status: "active" })
      .populate("category_id")
      .populate("hotel_id")
      .sort({ createdAt: -1 })
      .lean();

    const tourIds = tours.map((t) => t._id);

    /* ===== Images ===== */
    const images = await TourImage.find({
      tour_id: { $in: tourIds },
    }).lean();

    const imageMap = {};
    images.forEach((img) => {
      if (!imageMap[img.tour_id]) imageMap[img.tour_id] = [];
      imageMap[img.tour_id].push(img);
    });

    /* ===== Descriptions ===== */
    const descriptions = await Description.find({
      tour_id: { $in: tourIds },
    }).lean();

    const descriptionMap = {};
    descriptions.forEach((desc) => {
      if (!descriptionMap[desc.tour_id]) descriptionMap[desc.tour_id] = [];
      descriptionMap[desc.tour_id].push({
        title: desc.title,
        content: desc.content,
      });
    });

    const result = tours.map((tour) => ({
      ...tour,
      images: imageMap[tour._id] || [],
      descriptions: descriptionMap[tour._id] || [],
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

const getAllToursAdmin = async (req, res) => {
  try {
    const tours = await Tour.find()
      .populate("category_id")
      .populate("hotel_id")
      .sort({ createdAt: -1 })
      .lean();

    const tourIds = tours.map((t) => t._id);

    /* ===== Images ===== */
    const images = await TourImage.find({
      tour_id: { $in: tourIds },
    }).lean();

    const imageMap = {};
    images.forEach((img) => {
      if (!imageMap[img.tour_id]) imageMap[img.tour_id] = [];
      imageMap[img.tour_id].push(img);
    });

    /* ===== Descriptions ===== */
    const descriptions = await Description.find({
      tour_id: { $in: tourIds },
    }).lean();

    const descriptionMap = {};
    descriptions.forEach((desc) => {
      if (!descriptionMap[desc.tour_id]) descriptionMap[desc.tour_id] = [];
      descriptionMap[desc.tour_id].push({
        title: desc.title,
        content: desc.content,
      });
    });

    const result = tours.map((tour) => ({
      ...tour,
      images: imageMap[tour._id] || [],
      descriptions: descriptionMap[tour._id] || [],
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

const getTourBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    /* ===== 1. Tour (Chỉ lấy tour đang active) ===== */
    const tour = await Tour.findOne({
      slug,
      status: "active", // Đảm bảo không hiện tour đã ẩn
    })
      .populate("category_id", "name") // Chỉ lấy tên category
      .populate("hotel_id")
      .lean();

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tour hoặc tour đã bị tạm ẩn",
      });
    }

    const tourId = tour._id;

    /* ===== 2. Thực hiện các query song song để tối ưu tốc độ (Performance) ===== */
    const [images, descriptions, comments, itineraries, trips, favorite] =
      await Promise.all([
        TourImage.find({ tour_id: tourId }).lean(),
        Description.find({ tour_id: tourId }).select("title content").lean(),
        Comment.find({ tour_id: tourId })
          .populate("user_id", "name avatar")
          .sort({ createdAt: -1 })
          .lean(),
        Itinerary.find({ tour_id: tourId }).sort({ day_number: 1 }).lean(),
        /* Lọc Trip: Ẩn 'deleted', chỉ lấy 'open' và 'full' */
        Trip.find({
          tour_id: tourId,
          status: { $in: ["open", "full"] }, // 👈 Loại bỏ hoàn toàn 'deleted' và 'closed' (nếu muốn)
          start_date: { $gte: new Date() }, // 👈 Chỉ lấy những chuyến chưa khởi hành
        })
          .sort({ start_date: 1 })
          .lean(),
        /* Kiểm tra Favorite */
        req.user?._id
          ? Favorite.findOne({ user_id: req.user._id, tour_id: tourId })
          : null,
      ]);

    /* ===== 3. Xử lý Chi tiết hành trình (Itinerary Details) ===== */
    const itineraryIds = itineraries.map((i) => i._id);
    const details = await ItineraryDetail.find({
      itinerary_id: { $in: itineraryIds },
    })
      .populate("place_id")
      .sort({ order: 1 })
      .lean();

    const placeIds = details.map((d) => d.place_id?._id).filter(Boolean);
    const placeImages = await PlaceImage.find({
      place_id: { $in: placeIds },
    }).lean();

    // Map ảnh cho địa điểm
    const placeImageMap = {};
    placeImages.forEach((img) => {
      if (!placeImageMap[img.place_id]) placeImageMap[img.place_id] = [];
      placeImageMap[img.place_id].push(img);
    });

    details.forEach((d) => {
      if (d.place_id) {
        d.place_id.images = placeImageMap[d.place_id._id] || [];
      }
    });

    // Nhóm chi tiết vào từng ngày hành trình
    const detailMap = {};
    details.forEach((d) => {
      if (!detailMap[d.itinerary_id]) detailMap[d.itinerary_id] = [];
      detailMap[d.itinerary_id].push(d);
    });

    itineraries.forEach((i) => {
      i.details = detailMap[i._id] || [];
    });

    /* ===== 4. Trả về kết quả ===== */
    return res.status(200).json({
      success: true,
      data: {
        ...tour,
        images,
        descriptions,
        itineraries,
        trips: trips.map((trip) => ({
          ...trip,
          available_slots: trip.max_people - (trip.booked_people || 0),
        })),
        comments,
        isFavorite: !!favorite,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy chi tiết tour",
    });
  }
};

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
      "status",
      "hotel_id",
      "category_id",
      "start_location",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        tour[field] = req.body[field];
      }
    });

    /* ===== Tự động cập nhật slug theo name ===== */
    if (req.body.name) {
      tour.slug = slugify(req.body.name, { lower: true, strict: true });
    }

    await tour.save();

    /* ===== Upload new images ===== */
    if (req.files?.length) {
      const uploadedImages = await uploadMultipleImages(
        req.files,
        "pick_your_way/tours",
      );

      const images = uploadedImages.map((img) => ({
        tour_id: tour._id,
        ...img,
      }));

      await TourImage.insertMany(images);
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

const deleteTourImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await TourImage.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy ảnh",
      });
    }

    await cloudinary.uploader.destroy(image.public_id);
    await TourImage.findByIdAndDelete(imageId);

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

const updateTourStatus = async (req, res) => {
  try {
    const { slug } = req.params;
    const { status } = req.body;

    const validStatuses = ["active", "inactive"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const tour = await Tour.findOneAndUpdate(
      { slug },
      { status },
      { new: true },
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
  uploadTourImages,
  getAllTours,
  getAllToursAdmin,
  getTourBySlug,
  updateTour,
  deleteTourImage,
  updateTourStatus,
};
