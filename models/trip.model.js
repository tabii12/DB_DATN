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
  },
  {
    timestamps: true, 
    versionKey: false,
  }
);

tripSchema.pre("save", function (next) {
  if (this.end_date < this.start_date) {
    return next(new Error("Ngày kết thúc không thể trước ngày bắt đầu."));
  }
  next();
});

const Trip =
  mongoose.models.Trip || mongoose.model("Trip", tripSchema, "trips");

module.exports = Trip;