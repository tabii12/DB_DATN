const cloudinary = require("../utils/cloudinary");

const uploadMultipleImages = async (files, folder) => {
  if (!files || !files.length) return [];

  const streamUpload = (buffer) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        },
      );
      stream.end(buffer);
    });
  };

  const uploads = await Promise.all(
    files.map((file) => streamUpload(file.buffer)),
  );

  return uploads.map((img) => ({
    image_url: img.secure_url,
    public_id: img.public_id,
  }));
};

module.exports = { uploadMultipleImages };
