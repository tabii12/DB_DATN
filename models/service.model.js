const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["hotel", "transport", "restaurant", "ticket", "guide", "other"],
      // hotel: Khách sạn, transport: Xe, restaurant: Ăn uống,
      // ticket: Vé tham quan, guide: Hướng dẫn viên
    },
    basePrice: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      required: true,
      enum: ["per_person", "per_room", "per_meal", "per_day", "per_tour"],
      // Giúp tính toán giá tour tự động chính xác
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

const Service =
  mongoose.models.Service ||
  mongoose.model("Service", ServiceSchema, "services");
module.exports = Service;
