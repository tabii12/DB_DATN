const Trip = require("../models/trip.model");
const Tour = require("../models/tour.model");
const Service = require("../models/service.model");

const createTrip = async (req, res) => {
  try {
    const { tour_id, start_date, end_date, max_people, services } = req.body;

    // 1. Kiểm tra các trường bắt buộc
    if (!tour_id || !start_date || !end_date || !max_people) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu bắt buộc để tạo Trip",
      });
    }

    // 2. Kiểm tra Tour có tồn tại và đang active không
    const tour = await Tour.findOne({ _id: tour_id, status: "active" });
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour không tồn tại hoặc đã bị ẩn",
      });
    }

    // 3. Tính toán thời gian (Nights & Days)
    const start = new Date(start_date);
    const end = new Date(end_date);
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "Ngày kết thúc phải sau ngày bắt đầu",
      });
    }
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const days = nights + 1;

    // 4. Xử lý logic Services và tính toán Base Price
    let totalBaseCost = 0;
    const processedServices = [];

    if (services && Array.isArray(services)) {
      for (const item of services) {
        const serviceData = await Service.findById(item.service_id);
        if (!serviceData) continue;

        let serviceCost = 0;
        const unitPrice = serviceData.basePrice;

        switch (serviceData.unit) {
          case "per_person":
          case "per_meal":
            serviceCost = unitPrice * max_people * (item.quantity || 1);
            break;
          case "per_room":
            const rooms = Math.ceil(max_people / 2); // Mặc định 2 người/phòng
            serviceCost = unitPrice * rooms * nights;
            break;
          case "per_day":
            serviceCost = unitPrice * days * (item.quantity || 1);
            break;
          case "per_tour":
            serviceCost = unitPrice * (item.quantity || 1);
            break;
          default:
            serviceCost = unitPrice * (item.quantity || 1);
        }

        totalBaseCost += serviceCost;
        processedServices.push({
          service_id: item.service_id,
          unit_price: unitPrice,
          quantity: item.quantity || 1,
          note: serviceData.serviceName, // Lưu tên dịch vụ vào note để dễ xem lại
        });
      }
    }

    // 5. Tính giá bán cuối cùng (Lợi nhuận 20% và làm tròn đẹp)
    // Ví dụ: 1.250.300 -> 1.260.000 -> 1.259.000 (giá kiểu .999 cho chuyên nghiệp)
    const rawPrice = (totalBaseCost * 1.2) / max_people;
    const pricePerPerson = Math.ceil(rawPrice / 10000) * 10000 - 1000;

    // 6. Lưu vào Database
    const trip = await Trip.create({
      tour_id,
      start_date,
      end_date,
      max_people,
      services: processedServices,
      base_price: totalBaseCost,
      price: pricePerPerson,
    });

    // 7. Trả về kết quả thành công
    return res.status(201).json({
      success: true,
      message: "Tạo chuyến đi (Trip) thành công",
      data: trip,
      breakdown: {
        total_days: days,
        total_nights: nights,
        total_base_cost: totalBaseCost,
        suggested_price: pricePerPerson,
      },
    });
  } catch (error) {
    console.error("Error creating trip:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi hệ thống khi tạo Trip",
    });
  }
};

const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate({
        path: "tour_id",
        select: "name slug",
        populate: {
          path: "images", // Tên virtual mình vừa đặt ở trên
          select: "image_url",
          options: { limit: 1 }, // Chỉ lấy 1 ảnh duy nhất từ DB
        },
      })
      .populate({
        path: "services.service_id",
        select: "serviceName type unit",
      })
      .sort({ start_date: 1 })
      .lean();

    const enrichedTrips = trips.map((trip) => {
      // Vì đã dùng limit: 1 nên images sẽ là một mảng có 1 phần tử
      const tourImages = trip.tour_id?.images || [];
      const firstImage = tourImages.length > 0 ? tourImages[0].image_url : null;

      return {
        ...trip,
        tour_name: trip.tour_id?.name || "N/A",
        tour_thumb: firstImage, // Trả về link ảnh duy nhất cho Frontend
        duration:
          Math.ceil(
            (new Date(trip.end_date) - new Date(trip.start_date)) /
              (1000 * 60 * 60 * 24),
          ) + 1,
      };
    });

    return res.status(200).json({
      success: true,
      data: enrichedTrips,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTripsByTourSlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const tour = await Tour.findOne({ slug }).lean(); // Lấy cả tour ẩn
    if (!tour)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tour" });

    const trips = await Trip.find({ tour_id: tour._id })
      .populate("services.service_id") // Lấy full thông tin Service từ kho
      .sort({ createdAt: -1 })
      .lean();

    const data = trips.map((trip) => ({
      ...trip,
      revenue_expected: trip.price * (trip.booked_people || 0), // Doanh thu dự tính hiện tại
      net_profit_expected: trip.price * trip.max_people - trip.base_price, // Lợi nhuận tối đa nếu full khách
      fill_rate:
        (((trip.booked_people || 0) / trip.max_people) * 100).toFixed(2) + "%", // Tỉ lệ lấp đầy
    }));

    return res.status(200).json({ success: true, tour_name: tour.name, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy trip" });
    }

    // 1. Cập nhật các trường cơ bản
    const fields = [
      "start_date",
      "end_date",
      "max_people",
      "status",
      "services",
    ];
    fields.forEach((field) => {
      if (updateData[field] !== undefined) {
        trip[field] = updateData[field];
      }
    });

    // 2. Logic tính toán lại giá nếu có thay đổi ngày hoặc dịch vụ
    // Kiểm tra xem có thay đổi các yếu tố ảnh hưởng đến giá không
    const isPriceAffected =
      updateData.services ||
      updateData.start_date ||
      updateData.end_date ||
      updateData.max_people;

    if (isPriceAffected) {
      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const days = nights + 1;

      let totalBaseCost = 0;
      const processedServices = [];

      // Lặp qua danh sách services (mới hoặc cũ) để tính lại giá
      if (trip.services && Array.isArray(trip.services)) {
        for (const item of trip.services) {
          const serviceData = await Service.findById(item.service_id);
          if (!serviceData) continue;

          let serviceCost = 0;
          const unitPrice = serviceData.basePrice;

          switch (serviceData.unit) {
            case "per_person":
            case "per_meal":
              serviceCost = unitPrice * trip.max_people * (item.quantity || 1);
              break;
            case "per_room":
              const rooms = Math.ceil(trip.max_people / 2);
              serviceCost = unitPrice * rooms * nights;
              break;
            case "per_day":
              serviceCost = unitPrice * days * (item.quantity || 1);
              break;
            case "per_tour":
              serviceCost = unitPrice * (item.quantity || 1);
              break;
            default:
              serviceCost = unitPrice * (item.quantity || 1);
          }

          totalBaseCost += serviceCost;
          processedServices.push({
            service_id: item.service_id,
            unit_price: unitPrice,
            quantity: item.quantity || 1,
          });
        }
      }

      // Cập nhật lại giá trị mới vào object trip
      trip.services = processedServices;
      trip.base_price = totalBaseCost;

      // Nếu admin không tự nhập giá bán mới, hệ thống tự gợi ý giá theo lợi nhuận 20%
      if (!updateData.price) {
        const rawPrice = (totalBaseCost * 1.2) / trip.max_people;
        trip.price = Math.ceil(rawPrice / 10000) * 10000 - 1000;
      } else {
        trip.price = updateData.price;
      }
    }

    // 3. Kiểm tra trạng thái đóng tour tự động
    if (new Date(trip.end_date) < new Date()) {
      trip.status = "closed";
    }

    await trip.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật và tính toán lại giá trip thành công",
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

    // 1. Tìm Trip để kiểm tra sự tồn tại
    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chuyến khởi hành để xóa",
      });
    }

    // 2. Kiểm tra nếu Trip đã ở trạng thái deleted rồi
    if (trip.status === "deleted") {
      return res.status(400).json({
        success: false,
        message: "Chuyến đi này đã được xóa trước đó",
      });
    }

    // 3. Thực hiện Xóa mềm bằng cách cập nhật status
    // Lưu ý: Vẫn nên giữ lại dữ liệu nếu đã có người đặt
    trip.status = "deleted";
    await trip.save();

    return res.status(200).json({
      success: true,
      message: "Đã chuyển trạng thái chuyến đi thành 'Đã xóa'",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi thực hiện xóa mềm trip",
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
