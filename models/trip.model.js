const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    tour_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },

    start_date: {
      type: Date,
      required: true,
    },

    end_date: {
      type: Date,
      required: true,
    },

    // 👉 giá gốc (chưa gồm hotel)
    base_price: {
      type: Number,
      required: true,
      min: 0,
    },

    // 👉 giá cuối (đã gồm hotel)
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
   VALIDATION LOGIC
========================== */
tripSchema.pre("save", function (next) {
  // ===== DATE VALIDATION =====
  if (this.end_date <= this.start_date) {
    return next(new Error("Ngày kết thúc phải sau ngày bắt đầu."));
  }

  // ===== BOOKING VALIDATION =====
  if (this.booked_people > this.max_people) {
    return next(new Error("Số người đặt không thể vượt quá số chỗ tối đa."));
  }

  // ===== AUTO STATUS =====
  if (this.booked_people === this.max_people) {
    this.status = "full";
  } else if (this.booked_people === 0) {
    this.status = "open";
  }

  next();
});

/* ==========================
   AUTO UPDATE STATUS KHI UPDATE
========================== */
tripSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update.booked_people !== undefined && update.max_people !== undefined) {
    if (update.booked_people >= update.max_people) {
      update.status = "full";
    }
  }

  next();
});

const Trip =
  mongoose.models.Trip || mongoose.model("Trip", tripSchema, "trips");

module.exports = Trip;
