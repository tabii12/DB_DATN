const mongoose = require("mongoose");
const Booking = require("../models/booking.model");
const Trip = require("../models/trip.model");

const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const data = req.body;

    if (data.departureDate) {
      const [day, month, year] = data.departureDate.split("/");
      data.departureDate = new Date(`${year}-${month}-${day}`);
    }

    const {
      trip_id,
      adults = 0,
      children = 0,
      infants = 0,
      grandTotal,
      total,
      vnpay,
    } = data;

    const total_members = adults + children + infants;
    const total_price = grandTotal || total;

    const trip = await Trip.findById(trip_id).session(session);
    if (!trip) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy chuyến đi" });
    }

    if ((trip.booked_people || 0) + total_members > trip.max_people) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "Tour đã hết chỗ" });
    }

    const booked = trip.booked_people || 0;
    if (booked + total_members > trip.max_people) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Không còn đủ chỗ",
      });
    }

    // 4️⃣ Validate giá
    if (!total_price || total_price <= 0) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid total price",
      });
    }

    const isPaid = vnpay?.vnp_ResponseCode === "00";

    const bookingStatus = isPaid ? "confirmed" : "pending";
    const paymentStatus = isPaid ? "paid" : "failed";

    delete data.payment;
    delete data.paymentStatus;
    delete data.status;

    const bookingDoc = new Booking({
      ...data,
      user_id: userId,
      total_members,
      total_price,
      status: bookingStatus,
      vnpay: {
        method: vnpay ? "vnpay" : "bank_transfer",
        amount: vnpay.amount,
        status: paymentStatus,
        bank_code: vnpay?.vnp_BankCode || "NCB",
        bank_account_number: "0123456789",
        bank_account_name: "PICKYOURWAY COMPANY LIMITED",
        transfer_content: `BOOKING_${new mongoose.Types.ObjectId()}`,
      },
    });

    await bookingDoc.save({ session });

    // 6️⃣ Update slot
    await Trip.findByIdAndUpdate(
      trip_id,
      {
        $inc: { booked_people: total_members },
      },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        booking: bookingDoc,
        payment_info: {
          bank: bookingDoc.payment?.bank_code,
          account_number: bookingDoc.payment?.bank_account_number,
          account_name: bookingDoc.payment?.bank_account_name,
          amount: total_price,
          content: bookingDoc.payment?.transfer_content,
        },
      },
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

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
      .select(
        "trip_id tourName departureDate adults children infants total_price status createdAt thumbnail",
      )
      .populate({
        path: "trip_id",
        select: "start_date end_date",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { status, payment_status, trip_id } = req.query;

    const filter = {};

    // 1️⃣ Lọc theo trạng thái Booking
    if (status) {
      filter.status = status;
    }

    // 2️⃣ Lọc theo trạng thái thanh toán trong object vnpay
    if (payment_status) {
      filter["vnpay.status"] = payment_status;
    }

    if (trip_id) {
      filter.trip_id = trip_id;
    }

    // 3️⃣ Truy vấn với Nested Populate
    const bookings = await Booking.find(filter)
      .populate({
        path: "user_id",
        select: "name email phone role",
      })
      .populate({
        path: "trip_id",
        populate: {
          path: "services",
          model: "Service",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Admin Get All Bookings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy danh sách booking",
      error: error.message,
    });
  }
};

const getTripStatusReport = async (req, res) => {
  try {
    const trips = await Trip.find({ booked_people: { $gt: 0 } })
      .populate({
        path: "tour_id",
        select: "name start_location slug",
        populate: {
          path: "images",
          select: "image_url",
        },
      })
      .select("tour_id start_date max_people booked_people status")
      .sort({ start_date: 1 });

    const report = trips.map((trip) => {
      const maxPeople = trip.max_people || 1;
      const occupancyRate = ((trip.booked_people / maxPeople) * 100).toFixed(2);
      const minPeopleToStart = Math.ceil(maxPeople * 0.3);
      const isRisk = trip.booked_people < minPeopleToStart;

      const tourThumb = trip.tour_id?.images?.[0]?.image_url || null;

      return {
        tripId: trip._id,
        tourInfo: {
          id: trip.tour_id?._id,
          name: trip.tour_id?.name,
          image: tourThumb,
          startLocation: trip.tour_id?.start_location,
        },
        startDate: trip.start_date,
        capacity: `${trip.booked_people}/${trip.max_people}`,
        occupancyRate: `${occupancyRate}%`,
        status: trip.status,
        shouldStart: !isRisk,
        note: isRisk
          ? "Quá ít khách - Cân nhắc hủy/gộp tour"
          : "Đủ điều kiện khởi hành",
      };
    });

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bookingId = req.params.id;
    const { newStatus } = req.body;
    const userRole = req.user.role;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    const currentStatus = booking.status;
    const statusOrder = { pending: 1, confirmed: 2, paid: 3, cancelled: 0 };

    // 1. Chặn đi lùi trạng thái (Ví dụ: đã Paid thì không thể quay về Confirmed)
    if (currentStatus !== "cancelled" && newStatus !== "cancelled") {
      if (statusOrder[newStatus] < statusOrder[currentStatus]) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({
            success: false,
            message: "Không thể quay lại trạng thái trước đó",
          });
      }
    }

    // 2. Tự động tính toán các trường dựa trên Status mới
    let updateFields = { status: newStatus };

    if (userRole === "admin") {
      if (newStatus === "confirmed") {
        // Nếu lên Confirmed -> Mặc định hiểu là đã thanh toán 50%
        updateFields.paymentPct = 50;
        updateFields.payNow = booking.total_price * 0.5;
        updateFields.remaining = booking.total_price * 0.5;
      } else if (newStatus === "paid") {
        // Nếu lên Paid -> Mặc định hiểu là đã thanh toán 100%
        updateFields.paymentPct = 100;
        updateFields.payNow = booking.total_price;
        updateFields.remaining = 0;
      }

      // Cập nhật log thanh toán thủ công vào object vnpay
      if (newStatus === "confirmed" || newStatus === "paid") {
        updateFields.vnpay = {
          ...booking.vnpay?.toObject(),
          status: newStatus === "paid" ? "paid" : "partial",
          confirmed_by: userId,
          paid_at: new Date(),
        };
      }
    }

    // 3. Xử lý logic HỦY (Hoàn lại slot cho Trip)
    if (newStatus === "cancelled") {
      // Chỉ chủ đơn hoặc Admin mới được hủy
      if (
        booking.user_id.toString() !== userId.toString() &&
        userRole !== "admin"
      ) {
        await session.abortTransaction();
        return res
          .status(403)
          .json({ success: false, message: "Bạn không có quyền này" });
      }

      // Nếu là khách hủy: phải trước ngày đi 3 ngày
      const daysToDeparture =
        (new Date(booking.departureDate) - new Date()) / (1000 * 60 * 60 * 24);
      if (daysToDeparture < 3 && userRole !== "admin") {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ success: false, message: "Sắp khởi hành, không thể tự hủy" });
      }

      // Cộng lại slot người đi cho Trip
      await Trip.findByIdAndUpdate(
        booking.trip_id,
        {
          $inc: { booked_people: -booking.total_members },
        },
        { session },
      );
    }

    // 4. Lưu thay đổi
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { $set: updateFields },
      { new: true, session, runValidators: false },
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `Cập nhật trạng thái thành công: ${newStatus}`,
      data: updatedBooking,
    });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  }
};

const checkUserHasBooked = async (req, res) => {
  try {
    const userId = req.user._id;
    const { tourId } = req.params;

    const hasBooked = await Booking.findOne({
      user_id: userId,
      tour_id: tourId,
      status: "paid",
    }).select("_id");

    return res.status(200).json({
      success: true,
      hasBooked: !!hasBooked, // Trả về true nếu tìm thấy, false nếu không
      message: hasBooked
        ? "User đã đặt tour này"
        : "User chưa đặt hoặc chưa thanh toán",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getTripStatusReport,
  updateBookingStatus,
  checkUserHasBooked,
};
