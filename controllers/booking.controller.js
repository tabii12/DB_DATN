const mongoose = require("mongoose");
const Booking = require("../models/booking.model");
const Trip = require("../models/trip.model");
const TourMember = require("../models/tourMember.model");

const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { trip_id, total_members, members, total_price } = req.body;

    // 1️⃣ Check trip
    const trip = await Trip.findById(trip_id).session(session);
    if (!trip) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Trip not found" });
    }

    // 2️⃣ Validate số lượng
    if (!total_members || total_members < 1) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Total members must be at least 1",
      });
    }

    if (
      total_members > 1 &&
      (!members || members.length !== total_members - 1)
    ) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Members information is invalid",
      });
    }

    // 3️⃣ Validate member
    if (members?.length > 0) {
      for (const m of members) {
        if (!m.name || !m.age) {
          await session.abortTransaction();
          return res.status(400).json({
            message: "Each member must have name and age",
          });
        }
      }
    }

    // 4️⃣ Check available people
    const booked = trip.booked_people || 0;
    if (booked + total_members > trip.max_people) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Không còn đủ chỗ",
      });
    }

    // 5️⃣ Validate total_price (basic thôi)
    if (!total_price || total_price <= 0) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid total price",
      });
    }

    // 6️⃣ Tạo booking
    const [bookingDoc] = await Booking.create(
      [
        {
          trip_id,
          user_id: userId,
          total_members,
          total_price,
          status: "pending",
          payment: {
            amount: total_price,
            status: "pending",
            bank_code: "VCB",
            bank_account_number: "0123456789",
            bank_account_name: "CONG TY DU LICH ABC",
            transfer_content: "PENDING",
          },
        },
      ],
      { session },
    );

    // 7️⃣ Update transfer content (QUAN TRỌNG)
    bookingDoc.payment.transfer_content = `BOOKING_${bookingDoc._id}`;
    await bookingDoc.save({ session });

    // 8️⃣ Owner (người đặt)
    await TourMember.create(
      [
        {
          booking_id: bookingDoc._id,
          user_id: userId,
          name: req.user.name || "Người đặt",
          id_card: `OWNER_${Date.now()}`,
          is_owner: true,
        },
      ],
      { session },
    );

    // 9️⃣ Members đi cùng
    if (members?.length > 0) {
      const memberDocs = members.map((m) => ({
        booking_id: bookingDoc._id,
        name: m.name,
        age: m.age,
        id_card: m.id_card || `TEMP_${Date.now()}`,
        is_owner: false,
      }));

      await TourMember.insertMany(memberDocs, { session });
    }

    // 🔟 Update booked_people
    trip.booked_people += total_members;
    await trip.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        booking: bookingDoc,
        payment_info: {
          bank: "VCB",
          account_number: "0123456789",
          account_name: "CONG TY DU LICH ABC",
          amount: total_price,
          content: bookingDoc.payment.transfer_content,
        },
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
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

    const booking = await Booking.findById(bookingId)
      .populate({
        path: "trip_id",
        select: "name description start_date end_date price",
      })
      .populate({
        path: "members",
        select: "name age id_card is_owner",
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // 2️⃣ Check quyền
    if (booking.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
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

    // Decrement trip booked_people
    if (booking.trip_id) {
      await Trip.findByIdAndUpdate(booking.trip_id, {
        $inc: { booked_people: -booking.total_members },
      });
    }

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
