const multer = require("multer");

// Sử dụng bộ nhớ tạm (diskStorage) để lưu file trước khi upload lên Cloudinary
const storage = multer.diskStorage({});

// Hàm kiểm tra định dạng file (chỉ cho phép ảnh)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận định dạng file hình ảnh!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB mỗi file
});

module.exports = upload;