const Hotel = require("../models/hotel.model");
const Image = require("../models/image.model");
const cloudinary = require("../utils/cloudinary");

const createHotel = async (req, res) => {
  try {
    const { name, address, city, description, price_per_night, status } =
      req.body;

    // 1. Tạo khách sạn trước để lấy ID
    const newHotel = await Hotel.create({
      name,
      address,
      city,
      description,
      price_per_night,
      status,
    });

    // 2. Xử lý upload ảnh nếu có
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: "pick_your_way/hotels",
        })
      );

      const cloudinaryResults = await Promise.all(uploadPromises);

      // 3. Lưu thông tin ảnh vào model Image riêng biệt
      const imageData = cloudinaryResults.map((result) => ({
        entity_id: newHotel._id, // Liên kết với Hotel vừa tạo
        image_url: result.secure_url,
        public_id: result.public_id,
      }));

      await Image.insertMany(imageData);
    }

    return res.status(201).json({
      success: true,
      message: "Tạo khách sạn và lưu ảnh thành công",
      data: newHotel,
    });
  } catch (error) {
    console.error("🔥 Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllHotels = async (req, res) => {
  try {
    // Lấy danh sách khách sạn đang hoạt động
    const hotels = await Hotel.find({ status: "active" }).sort({
      createdAt: -1,
    });

    // Với mỗi khách sạn, tìm các ảnh tương ứng trong bảng Image
    const hotelsWithImages = await Promise.all(
      hotels.map(async (hotel) => {
        const images = await Image.find({ entity_id: hotel._id });
        return {
          ...hotel._doc, // Giải nén dữ liệu khách sạn
          images: images, // Đính kèm mảng ảnh vào
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: hotelsWithImages.length,
      data: hotelsWithImages,
    });
  } catch (error) {
    console.error("🔥 Lỗi GetAllHotels:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống: " + error.message,
    });
  }
};

const getHotelBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Tìm khách sạn theo slug duy nhất
    const hotel = await Hotel.findOne({ slug, status: "active" });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khách sạn với đường dẫn này.",
      });
    }

    // Lấy tất cả ảnh liên quan đến khách sạn này
    const images = await Image.find({ entity_id: hotel._id });

    return res.status(200).json({
      success: true,
      data: {
        ...hotel._doc,
        images: images,
      },
    });
  } catch (error) {
    console.error("🔥 Lỗi GetHotelBySlug:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống: " + error.message,
    });
  }
};

const updateHotel = async (req, res) => {
  try {
    const { slug } = req.params; // Lấy slug cũ từ URL
    const { name, address, city, description, price_per_night, status } =
      req.body;

    // 1. Tìm khách sạn theo slug
    let hotel = await Hotel.findOne({ slug });
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khách sạn với đường dẫn này",
      });
    }

    // 2. Cập nhật các trường dữ liệu
    hotel.name = name || hotel.name;
    hotel.address = address || hotel.address;
    hotel.city = city || hotel.city;
    hotel.description = description || hotel.description;
    hotel.price_per_night = price_per_night || hotel.price_per_night;
    hotel.status = status || hotel.status;

    await hotel.save();

    // 3. Xử lý ảnh mới (nếu có)
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: "pick_your_way/hotels",
        })
      );
      const cloudinaryResults = await Promise.all(uploadPromises);

      const newImages = cloudinaryResults.map((result) => ({
        entity_id: hotel._id,
        image_url: result.secure_url,
        public_id: result.public_id,
      }));

      await Image.insertMany(newImages);
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật thành công",
      data: hotel,
    });
  } catch (error) {
    console.error("🔥 Error updating by slug:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteHotelImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await Image.findById(imageId);
    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy ảnh" });
    }

    // Xóa trên Cloudinary
    await cloudinary.uploader.destroy(image.public_id);

    // Xóa trong Database
    await Image.findByIdAndDelete(imageId);

    return res
      .status(200)
      .json({ success: true, message: "Xóa ảnh thành công" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateHotelStatus = async (req, res) => {
  try {
    const { slug } = req.params;
    const { status } = req.body;

    // 1. Kiểm tra status gửi lên có hợp lệ với Enum trong Model không
    const validStatuses = ["active", "inactive", "hidden"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ. Chỉ chấp nhận: active, inactive, hidden",
      });
    }

    // 2. Tìm và cập nhật trạng thái
    const hotel = await Hotel.findOneAndUpdate(
      { slug },
      { status },
      { new: true, runValidators: true }
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khách sạn để cập nhật",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Đã thay đổi trạng thái khách sạn thành: ${status}`,
      data: {
        name: hotel.name,
        status: hotel.status,
        slug: hotel.slug
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
  createHotel,
  getAllHotels,
  getHotelBySlug,
  updateHotel,
  deleteHotelImage,
  updateHotelStatus,
};
