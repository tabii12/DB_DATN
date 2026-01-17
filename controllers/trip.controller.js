const Trip = require("../models/trip.model");
const Tour = require("../models/tour.model");

const createTrip = async (req, res) => {
  try {
    const { tour_id, start_date, end_date, price, max_people } = req.body;

    // Validate cơ bản
    if (!tour_id || !start_date || !end_date || !price || !max_people) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu bắt buộc",
      });
    }

    const trip = await Trip.create({
      tour_id,
      start_date,
      end_date,
      price,
      max_people,
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

const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("tour_id", "name slug")
      .sort({ start_date: 1 });

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

const getTripsByTourSlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const tour = await Tour.findOne({ slug });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tour",
      });
    }
    const trips = await Trip.find({ tour_id: tour._id })
      .populate("tour_id", "name slug")
      .sort({ start_date: 1 });

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

const updateTripById = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy trip hiện tại
    const currentTrip = await Trip.findById(id);
    if (!currentTrip) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy trip",
      });
    }

    const startDate = req.body.start_date || currentTrip.start_date;
    const endDate = req.body.end_date || currentTrip.end_date;

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: "Ngày kết thúc không thể trước ngày bắt đầu",
      });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật trip thành công",
      data: updatedTrip,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật trip",
    });
  }
};

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
