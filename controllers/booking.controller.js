const Booking = require("../models/booking.model");
const Trip = require("../models/trip.model");
const TourMember = require("../models/tourMember.model");

const createBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const { trip_id, total_members, members } = req.body;

    // 1️⃣ Check trip tồn tại
    const trip = await Trip.findById(trip_id);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // 2️⃣ Validate số lượng người
    if (total_members < 1) {
      return res
        .status(400)
        .json({ message: "Total members must be at least 1" });
    }

    if (
      total_members > 1 &&
      (!members || members.length !== total_members - 1)
    ) {
      return res.status(400).json({
        message: "Members information is invalid",
      });
    }

    // 3️⃣ Tính tổng tiền
    const total_price = trip.price * total_members;

    // 4️⃣ Tạo booking
    const booking = await Booking.create({
      trip_id,
      user_id: userId,
      total_members,
      total_price,
      payment: {
        amount: total_price,
        status: "pending",
        bank_code: "VCB",
        bank_account_number: "0123456789",
        bank_account_name: "CONG TY DU LICH ABC",
        transfer_content: `BOOKING_${Date.now()}`,
      },
    });

    // 5️⃣ Tạo TourMember cho người đặt
    await TourMember.create({
      booking_id: booking._id,
      user_id: userId,
      is_owner: true,
    });

    // 6️⃣ Tạo TourMember cho người đi cùng
    if (members && members.length > 0) {
      const memberDocs = members.map((m) => ({
        booking_id: booking._id,
        name: m.name,
        age: m.age,
        id_card: m.id_card,
        is_owner: false,
      }));

      await TourMember.insertMany(memberDocs);
    }

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ user_id: userId })
      .populate({
        path: "trip_id",
        select: "name start_date end_date price",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getBookingDetail = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookingId = req.params.id;

    // 1️⃣ Tìm booking + populate trip
    const booking = await Booking.findById(bookingId).populate({
      path: "trip_id",
      select: "name description start_date end_date price",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // 2️⃣ Check quyền (chỉ chủ booking)
    if (booking.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // 3️⃣ Lấy danh sách thành viên
    const members = await TourMember.find({
      booking_id: booking._id,
    }).select("-__v");

    return res.status(200).json({
      success: true,
      data: {
        booking,
        members,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { status, payment_status, trip_id } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (payment_status) {
      filter["payment.status"] = payment_status;
    }

    if (trip_id) {
      filter.trip_id = trip_id;
    }

    const bookings = await Booking.find(filter)
      .populate({
        path: "trip_id",
        select: "name start_date end_date",
      })
      .populate({
        path: "user_id",
        select: "name email",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const adminId = req.user._id; // admin đã đăng nhập
    const bookingId = req.params.id;

    // 1️⃣ Tìm booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // 2️⃣ Check trạng thái hiện tại
    if (booking.payment.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Booking already paid",
      });
    }

    // 3️⃣ Update payment + booking status
    booking.payment.status = "paid";
    booking.payment.paid_at = new Date();
    booking.payment.confirmed_by = adminId;

    booking.status = "paid";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      data: booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId).populate("trip_id");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking không tồn tại",
      });
    }

    // ❗ Chỉ người đặt hoặc admin mới được huỷ
    if (
      booking.user_id.toString() !== userId.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền huỷ booking này",
      });
    }

    // ❌ Không cho huỷ nếu đã thanh toán
    if (booking.payment.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Booking đã thanh toán, không thể huỷ",
      });
    }

    // ❌ Không cho huỷ nếu tour đã bắt đầu
    if (new Date() >= new Date(booking.trip_id.start_date)) {
      return res.status(400).json({
        success: false,
        message: "Tour đã bắt đầu, không thể huỷ",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Huỷ booking thành công",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingDetail,
  getAllBookings,
  confirmPayment,
  cancelBooking,
};
