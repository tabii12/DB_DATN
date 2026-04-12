const ItineraryDetail = require("../models/itineraryDetail.model");

const createItineraryDetail = async (req, res) => {
  try {
    // 1. Log dữ liệu nhận được từ Frontend để kiểm tra xem có bị thiếu/sai format không
    console.log(">>> Request Body:", req.body);

    const { itinerary_id, place_id, type, title, content, order } = req.body;

    // 2. Kiểm tra nhanh các trường bắt buộc trước khi gọi Database
    if (!itinerary_id) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu itinerary_id" });
    }

    // 3. Xử lý place_id: Nếu là chuỗi rỗng hoặc undefined, hãy xóa nó đi
    // để tránh lỗi Mongoose CastError (lỗi định dạng ObjectId)
    const updateData = {
      itinerary_id,
      type,
      title,
      content,
      order,
    };

    if (place_id && place_id.trim() !== "") {
      updateData.place_id = place_id;
    }

    const detail = await ItineraryDetail.create(updateData);

    return res.status(201).json({
      success: true,
      message: "Tạo itinerary detail thành công",
      data: detail,
    });
  } catch (error) {
    // 4. Log toàn bộ Object error ra Console của Server (Terminal)
    // Đây là nơi bạn sẽ thấy "Lỗi ở đâu" (Dòng bao nhiêu, file nào)
    console.error("<<< LOG LỖI CHI TIẾT:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined, // Hiện vị trí lỗi nếu đang ở môi trường dev
      name: error.name, // Trả về tên lỗi (vd: CastError, ValidationError)
    });
  }
};

const getDetailsByItinerary = async (req, res) => {
  try {
    const { itineraryId } = req.params;

    const details = await ItineraryDetail.find({
      itinerary_id: itineraryId,
    })
      .populate("place_id")
      .sort({ order: 1 });

    return res.status(200).json({
      success: true,
      total: details.length,
      data: details,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateItineraryDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const detail = await ItineraryDetail.findById(id);
    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy itinerary detail",
      });
    }

    const fields = ["place_id", "type", "title", "content", "order"];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        detail[field] = req.body[field];
      }
    });

    await detail.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật itinerary detail thành công",
      data: detail,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteItineraryDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const detail = await ItineraryDetail.findByIdAndDelete(id);
    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy itinerary detail",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xoá itinerary detail thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createItineraryDetail,
  getDetailsByItinerary,
  updateItineraryDetail,
  deleteItineraryDetail,
};
