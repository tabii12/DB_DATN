const Flight = require("../models/flight.model");
const Image = require("../models/image.model");
const cloudinary = require("../utils/cloudinary");

/* ======================================================
   CREATE FLIGHT
   - Tạo chuyến bay mới
   - Validate thời gian bay
   - Check trùng flight_code
   - Upload ảnh (nếu có)
====================================================== */
const createFlight = async (req, res) => {
  try {
    const {
      flight_code,
      departure,
      destination,
      departure_time,
      arrival_time,
      price,
      total_seats,
    } = req.body;

    /* ===== Validate thời gian ===== */
    if (new Date(arrival_time) <= new Date(departure_time)) {
      return res.status(400).json({
        success: false,
        message: "Thời gian hạ cánh phải sau thời gian cất cánh!",
      });
    }

    /* ===== Check flight_code trùng ===== */
    const existedFlight = await Flight.findOne({
      flight_code: flight_code.toUpperCase(),
    });

    if (existedFlight) {
      return res.status(400).json({
        success: false,
        message: "Mã chuyến bay đã tồn tại",
      });
    }

    /* ===== Tạo flight ===== */
    const newFlight = await Flight.create({
      flight_code: flight_code.toUpperCase(),
      departure,
      destination,
      departure_time,
      arrival_time,
      price,
      total_seats: total_seats || 100,
    });

    /* ===== Upload images (nếu có) ===== */
    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: "pick_your_way/flights",
          })
        )
      );

      const images = uploads.map((img) => ({
        entity_id: newFlight._id,
        image_url: img.secure_url,
        public_id: img.public_id,
      }));

      await Image.insertMany(images);
    }

    return res.status(201).json({
      success: true,
      message: "Tạo chuyến bay thành công",
      data: newFlight,
    });
  } catch (error) {
    console.error("🔥 CreateFlight Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   GET ALL FLIGHTS
   - Lấy danh sách chuyến bay
   - Gắn images bằng lookup
   - Tính available_seats
====================================================== */
const getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.aggregate([
      {
        $lookup: {
          from: "images",
          localField: "_id",
          foreignField: "entity_id",
          as: "images",
        },
      },
      {
        $addFields: {
          available_seats: {
            $subtract: ["$total_seats", "$booked_seats"],
          },
        },
      },
      {
        $sort: { departure_time: 1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    console.error("🔥 GetAllFlights Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   GET FLIGHT BY CODE
   - Tìm flight theo flight_code
   - Gắn images
   - Tính available_seats
====================================================== */
const getFlightByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const flight = await Flight.aggregate([
      {
        $match: { flight_code: code.toUpperCase() },
      },
      {
        $lookup: {
          from: "images",
          localField: "_id",
          foreignField: "entity_id",
          as: "images",
        },
      },
      {
        $addFields: {
          available_seats: {
            $subtract: ["$total_seats", "$booked_seats"],
          },
        },
      },
    ]);

    if (!flight.length) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chuyến bay",
      });
    }

    return res.status(200).json({
      success: true,
      data: flight[0],
    });
  } catch (error) {
    console.error("🔥 GetFlightByCode Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   UPDATE FLIGHT BY CODE
   - Update thông tin flight
   - Validate lại thời gian
   - Upload thêm ảnh (nếu có)
====================================================== */
const updateFlightByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const {
      departure,
      destination,
      departure_time,
      arrival_time,
      price,
      total_seats,
      status,
    } = req.body;

    const flight = await Flight.findOne({
      flight_code: code.toUpperCase(),
    });

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chuyến bay",
      });
    }

    /* ===== Validate thời gian ===== */
    const finalDeparture = departure_time || flight.departure_time;
    const finalArrival = arrival_time || flight.arrival_time;

    if (new Date(finalArrival) <= new Date(finalDeparture)) {
      return res.status(400).json({
        success: false,
        message: "Thời gian hạ cánh phải sau thời gian cất cánh!",
      });
    }

    /* ===== Update data ===== */
    flight.departure = departure ?? flight.departure;
    flight.destination = destination ?? flight.destination;
    flight.departure_time = finalDeparture;
    flight.arrival_time = finalArrival;
    flight.price = price ?? flight.price;
    flight.total_seats = total_seats ?? flight.total_seats;
    flight.status = status ?? flight.status;

    await flight.save();

    /* ===== Upload images mới ===== */
    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: "pick_your_way/flights",
          })
        )
      );

      const images = uploads.map((img) => ({
        entity_id: flight._id,
        image_url: img.secure_url,
        public_id: img.public_id,
      }));

      await Image.insertMany(images);
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật chuyến bay thành công",
      data: flight,
    });
  } catch (error) {
    console.error("🔥 UpdateFlight Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   DELETE FLIGHT IMAGE
   - Xóa ảnh theo imageId
   - Xóa Cloudinary + Database
====================================================== */
const deleteFlightImage = async (req, res) => {
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
   UPDATE FLIGHT STATUS
   - Chỉ update trạng thái
====================================================== */
const updateFlightStatus = async (req, res) => {
  try {
    const { code } = req.params;
    const { status } = req.body;

    const validStatuses = ["available", "full", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ (available | full | cancelled)",
      });
    }

    const flight = await Flight.findOneAndUpdate(
      { flight_code: code.toUpperCase() },
      { status },
      { new: true, runValidators: true }
    );

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chuyến bay",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: {
        flight_code: flight.flight_code,
        status: flight.status,
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
  createFlight,
  getAllFlights,
  getFlightByCode,
  updateFlightByCode,
  deleteFlightImage,
  updateFlightStatus,
};
