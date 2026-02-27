const cloudinary = require("../utils/cloudinary");

const uploadMultipleImages = async (files, folder) => {
  if (!files || !files.length) return [];

  const uploads = await Promise.all(
    files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder,
      }),
    ),
  );

  return uploads.map((img) => ({
    image_url: img.secure_url,
    public_id: img.public_id,
  }));
};

module.exports = { uploadMultipleImages };