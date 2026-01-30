const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    tour_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
      index: true,
    },

    start_date: {
      type: Date,
      required: true,
    },

    end_date: {
      type: Date,
      required: true,
    },

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
      index: true,
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
  // end_date phải sau start_date
  if (this.end_date < this.start_date) {
    return next(new Error("Ngày kết thúc không thể trước ngày bắt đầu."));
  }

  // booked_people không vượt max_people
  if (this.booked_people > this.max_people) {
    return next(new Error("Số người đặt không thể vượt quá số chỗ tối đa."));
  }

  // auto full khi đủ chỗ
  if (this.booked_people === this.max_people) {
    this.status = "full";
  }

  next();
});

const Trip =
  mongoose.models.Trip || mongoose.model("Trip", tripSchema, "trips");

module.exports = Trip;
