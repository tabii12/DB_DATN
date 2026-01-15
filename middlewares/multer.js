const multer = require("multer");

/* ================= MULTER CONFIG ================= */
/**
 * Cấu hình Multer dùng để upload file
 * - Lưu file tạm thời trên server
 * - Kiểm tra định dạng file
 * - Giới hạn dung lượng file
 */

/* ========= 1. Storage ========= */
/**
 * Sử dụng diskStorage mặc định
 * → File sẽ được lưu tạm để upload lên Cloudinary
 */
const storage = multer.diskStorage({});

/* ========= 2. File Filter ========= */
/**
 * Chỉ cho phép upload file hình ảnh
 */
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận định dạng file hình ảnh!"), false);
  }
};

/* ========= 3. Multer Instance ========= */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB / file
  },
});

module.exports = upload;
