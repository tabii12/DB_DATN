const mongoose = require("mongoose");

const homeSchema = new mongoose.Schema(
  {
    banners: [
      {
        image_url: String,
        public_id: String,
      },
    ],
    combos: [
      {
        name: String,
        location: String,
        slug: String,
        image_url: String,
        public_id: String,
        price: Number,
        stars: Number,
        tag: String,
        nights: Number,
        discount_percent: Number,
        amenities: [String],
      },
    ],
    styles: [
      {
        title: String,
        subtitle: String,
        count: String,
        href: String,
        image_url: String,
        public_id: String,
        color: String,
      },
    ],
    destinations: [
      {
        name: String,
        slug: String,
        hotel_count: Number,
        image_url: String,
        public_id: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Home", homeSchema);