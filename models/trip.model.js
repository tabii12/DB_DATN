const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    tour_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },

    services: [
      {
        service_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },
        // Lưu lại giá tại thời điểm thêm vào Trip (đề phòng sau này bảng Service đổi giá)
        unit_price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],

    start_date: {
      type: Date,
      required: true,
    },

    end_date: {
      type: Date,
      required: true,
    },

    // Giá gốc (Tổng các service tính theo giá nhập)
    base_price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // Giá cuối bán cho khách (base_price + lợi nhuận)
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    max_people: {
      type: Number,
      required: true,
      min: 1,
    },

    booked_people: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["open", "closed", "full"],
      default: "open",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/* ==========================
   VALIDATION & LOGIC
========================== */
tripSchema.pre("save", function (next) {
  // 1. Kiểm tra ngày tháng
  if (this.end_date <= this.start_date) {
    return next(new Error("Ngày kết thúc phải sau ngày bắt đầu."));
  }

  // 2. Tự động tính base_price dựa trên mảng services (nếu có)
  // Lưu ý: Logic này chỉ tính tổng thô, bạn có thể tinh chỉnh tùy unit của service
  if (this.services && this.services.length > 0) {
    this.base_price = this.services.reduce((total, item) => {
      return total + item.unit_price * item.quantity;
    }, 0);
  }

  // 3. Tự động cập nhật trạng thái theo số người đặt
  if (this.booked_people >= this.max_people) {
    this.status = "full";
  } else if (this.booked_people === 0) {
    this.status = "open";
  }

  next();
});

const Trip =
  mongoose.models.Trip || mongoose.model("Trip", tripSchema, "trips");
module.exports = Trip;
