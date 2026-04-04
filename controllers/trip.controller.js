const Trip = require("../models/trip.model");
const Tour = require("../models/tour.model");

const createTrip = async (req, res) => {
  try {
    const { tour_id, start_date, end_date, max_people, base_price } = req.body;

    // ===== VALIDATE =====
    const missingFields = [];

    if (!tour_id) missingFields.push("tour_id");
    if (!start_date) missingFields.push("start_date");
    if (!end_date) missingFields.push("end_date");
    if (!max_people) missingFields.push("max_people");
    if (!base_price) missingFields.push("base_price");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu bắt buộc",
        missingFields,
        receivedData: req.body,
      });
    }

    // ===== CHECK TOUR =====
    const tour = await Tour.findOne({
      _id: tour_id,
      status: "active",
    }).populate("hotel_id");

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour không tồn tại hoặc đang bị ẩn",
      });
    }

    // ===== TÍNH SỐ ĐÊM =====
    const start = new Date(start_date);
    const end = new Date(end_date);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "Ngày kết thúc phải sau ngày bắt đầu",
      });
    }

    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    // ===== TÍNH GIÁ KHÁCH SẠN =====
    let hotelTotal = 0;
    let hotelPerPerson = 0;

    if (tour.hotel_id) {
      const hotelPricePerNight = tour.hotel_id.price_per_night || 0;
      const capacity = tour.hotel_id.capacity || 2;

      const rooms = Math.ceil(max_people / capacity);

      hotelTotal = hotelPricePerNight * nights * rooms;
      hotelPerPerson = hotelTotal / max_people;
    }

    // ===== GIÁ CUỐI =====
    const rawPrice = Number(base_price) + hotelPerPerson;

    // 👉 làm tròn kiểu đẹp (optional)
    const price = Math.ceil(rawPrice / 10000) * 10000 - 1000;

    // ===== CREATE TRIP =====
    const trip = await Trip.create({
      tour_id,
      start_date,
      end_date,
      max_people,
      price,
      base_price,
    });

    console.log({
      hotelTotal,
      hotelPerPerson,
      finalPrice: price,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo trip thành công",
      data: {
        trip,
        breakdown: {
          base_price,
          hotelTotal,
          hotelPerPerson,
          nights,
        },
      },
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
