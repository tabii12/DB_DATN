const Flight = require("../models/flight.model");
const Image = require("../models/image.model");
const cloudinary = require("../utils/cloudinary");

const createFlight = async (req, res) => {
  try {
    const { 
      flight_code, departure, destination, 
      departure_time, arrival_time, price, total_seats 
    } = req.body;

    // 1. Kiểm tra logic: Thời gian đến phải sau thời gian đi
    if (new Date(arrival_time) <= new Date(departure_time)) {
      return res.status(400).json({
        success: false,
        message: "Thời gian hạ cánh phải sau thời gian cất cánh!",
      });
    }

    // 2. Kiểm tra mã chuyến bay đã tồn tại chưa
    const existedFlight = await Flight.findOne({ flight_code: flight_code.toUpperCase() });
    if (existedFlight) {
      return res.status(400).json({
        success: false,
        message: "Mã chuyến bay này đã tồn tại trên hệ thống",
      });
    }

    // 3. Tạo chuyến bay mới
    const newFlight = await Flight.create({
      flight_code: flight_code.toUpperCase(),
      departure,
      destination,
      departure_time,
      arrival_time,
      price,
      total_seats: total_seats || 100,
    });

    // 4. Xử lý lưu ảnh vào bảng Image (nếu có)
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "pick_your_way/flights" })
      );
      const cloudinaryResults = await Promise.all(uploadPromises);

      const imageData = cloudinaryResults.map((result) => ({
        entity_id: newFlight._id, // Gắn ID của chuyến bay vừa tạo
        image_url: result.secure_url,
        public_id: result.public_id,
        entity_type: "Flight", // Giúp phân biệt ảnh của Flight với Hotel
      }));

      await Image.insertMany(imageData);
    }

    return res.status(201).json({
      success: true,
      message: "Tạo chuyến bay thành công",
      data: newFlight,
    });
  } catch (error) {
    console.error("🔥 Lỗi Create Flight:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

const getAllFlights = async (req, res) => {
  try {
    // Sử dụng aggregate để kết hợp dữ liệu từ bảng flights và images
    const flights = await Flight.aggregate([
      {
        $lookup: {
          from: "images",           // Tên collection chứa ảnh (phải khớp với tên trong Compass)
          localField: "_id",        // Khóa chính của bảng Flight
          foreignField: "entity_id",// Khóa ngoại trong bảng Image trỏ về Flight
          as: "flight_images"       // Tên mảng ảnh sẽ hiển thị trong kết quả
        }
      },
      {
        $addFields: {
          // Tính toán số ghế trống ngay trong lúc lấy dữ liệu
          available_seats: { $subtract: ["$total_seats", "$booked_seats"] }
        }
      },
      {
        $sort: { departure_time: 1 } // Sắp xếp theo thời gian khởi hành sớm nhất
      }
    ]);

    return res.status(200).json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    console.error("🔥 Lỗi GetAllFlights:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống: " + error.message,
    });
  }
};

const getFlightByCode = async (req, res) => {
  try {
    const { code } = req.params;

    // Sử dụng aggregate để join bảng Image và tính toán ghế trống
    const flight = await Flight.aggregate([
      {
        $match: { flight_code: code.toUpperCase() } // Tìm đúng mã chuyến bay (viết hoa)
      },
      {
        $lookup: {
          from: "images",           // Tên collection chứa ảnh
          localField: "_id",        // ID của Flight
          foreignField: "entity_id",// Trường trỏ về ID của Flight trong bảng Image
          as: "flight_images"
        }
      },
      {
        $addFields: {
          available_seats: { $subtract: ["$total_seats", "$booked_seats"] }
        }
      }
    ]);

    // Vì aggregate trả về mảng, nên ta kiểm tra phần tử đầu tiên
    if (!flight || flight.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chuyến bay với mã này",
      });
    }

    return res.status(200).json({
      success: true,
      data: flight[0], // Trả về object đầu tiên thay vì mảng
    });
  } catch (error) {
    console.error("🔥 Lỗi GetFlightByCode:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống: " + error.message,
    });
  }
};

const updateFlightByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const { 
      departure, destination, departure_time, 
      arrival_time, price, total_seats, status 
    } = req.body;

    // 1. Tìm chuyến bay hiện tại
    let flight = await Flight.findOne({ flight_code: code.toUpperCase() });
    if (!flight) {
      return res.status(404).json({ success: false, message: "Không tìm thấy chuyến bay" });
    }

    // 2. Kiểm tra logic thời gian nếu người dùng cập nhật ngày giờ
    const finalDeparture = departure_time || flight.departure_time;
    const finalArrival = arrival_time || flight.arrival_time;
    
    if (new Date(finalArrival) <= new Date(finalDeparture)) {
      return res.status(400).json({
        success: false,
        message: "Thời gian hạ cánh phải sau thời gian cất cánh!",
      });
    }

    // 3. Cập nhật thông tin cơ bản
    const updateData = {
      departure: departure || flight.departure,
      destination: destination || flight.destination,
      departure_time: finalDeparture,
      arrival_time: finalArrival,
      price: price || flight.price,
      total_seats: total_seats || flight.total_seats,
      status: status || flight.status,
    };

    flight = await Flight.findOneAndUpdate(
      { flight_code: code.toUpperCase() },
      updateData,
      { new: true, runValidators: true }
    );

    // 4. Xử lý nếu có ảnh mới được gửi lên
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "pick_your_way/flights" })
      );
      const cloudinaryResults = await Promise.all(uploadPromises);

      const newImages = cloudinaryResults.map((result) => ({
        entity_id: flight._id,
        image_url: result.secure_url,
        public_id: result.public_id,
        entity_type: "Flight"
      }));

      await Image.insertMany(newImages);
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật chuyến bay thành công",
      data: flight,
    });
  } catch (error) {
    console.error("🔥 Lỗi UpdateFlight:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFlightImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const image = await Image.findById(imageId);
    
    if (image) {
      // Xóa trên Cloudinary
      await cloudinary.uploader.destroy(image.public_id);
      // Xóa trong DB
      await Image.findByIdAndDelete(imageId);
    }
    
    return res.status(200).json({ success: true, message: "Đã xóa ảnh" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateFlightStatus = async (req, res) => {
  try {
    const { code } = req.params; // Lấy flight_code từ URL
    const { status } = req.body; // Lấy status mới từ Body

    // 1. Kiểm tra status gửi lên có hợp lệ với Enum trong Model không
    const validStatuses = ["available", "full", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ. Chỉ chấp nhận: available, full, cancelled",
      });
    }

    // 2. Tìm và cập nhật trạng thái theo flight_code
    const flight = await Flight.findOneAndUpdate(
      { flight_code: code.toUpperCase() },
      { status },
      { new: true, runValidators: true }
    );

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chuyến bay để cập nhật trạng thái",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Đã cập nhật trạng thái chuyến bay ${flight.flight_code} thành: ${status}`,
      data: {
        flight_code: flight.flight_code,
        status: flight.status
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống: " + error.message,
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