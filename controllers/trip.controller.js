const Trip = require("../models/trip.model");
const Tour = require("../models/tour.model");

/* ======================================================
   CREATE TRIP
====================================================== */
const createTrip = async (req, res) => {
  try {
    const { tour_id, start_date, end_date, price, max_people } = req.body;

    if (!tour_id || !start_date || !end_date || !price || !max_people) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu bắt buộc",
      });
    }

    // Check tour tồn tại & đang active
    const tour = await Tour.findOne({ _id: tour_id, status: "active" });
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour không tồn tại hoặc đang bị ẩn",
      });
    }

    const trip = await Trip.create({
      tour_id,
      start_date,
      end_date,
      price,
      max_people,
      // status để default = "open"
    });

    return res.status(201).json({
      success: true,
      message: "Tạo trip thành công",
      data: trip,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi tạo trip",
    });
  }
};

/* ======================================================
   GET ALL TRIPS (ADMIN)
====================================================== */
const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("tour_id", "name slug")
      .sort({ start_date: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: trips,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách trip",
    });
  }
};

/* ======================================================
   GET TRIPS BY TOUR SLUG (FRONTEND)
====================================================== */
const getTripsByTourSlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const tour = await Tour.findOne({ slug, status: "active" });
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tour",
      });
    }

    const trips = await Trip.find({
      tour_id: tour._id,
      status: { $in: ["open", "full"] },
    })
      .sort({ start_date: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: trips,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách trip theo tour",
    });
  }
};

/* ======================================================
   UPDATE TRIP BY ID (ADMIN)
====================================================== */
const updateTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy trip",
      });
    }

    const allowedStatus = ["open", "closed", "full"];
    const fields = ["start_date", "end_date", "price", "max_people", "status"];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Không cho full → open
        if (
          field === "status" &&
          trip.status === "full" &&
          req.body.status === "open"
        ) {
          return;
        }

        // Validate enum status
        if (field === "status" && !allowedStatus.includes(req.body.status)) {
          return;
        }

        trip[field] = req.body[field];
      }
    });

    // Nếu trip đã kết thúc → auto closed
    if (new Date(trip.end_date) < new Date()) {
      trip.status = "closed";
    }

    await trip.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật trip thành công",
      data: trip,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật trip",
    });
  }
};

/* ======================================================
   DELETE TRIP
====================================================== */
const deleteTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTrip = await Trip.findByIdAndDelete(id);
    if (!deletedTrip) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy trip",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa trip thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi xóa trip",
    });
  }
};

module.exports = {
  createTrip,
  getAllTrips,
  getTripsByTourSlug,
  updateTripById,
  deleteTripById,
};
