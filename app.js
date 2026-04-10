require("dotenv").config();

var cors = require("cors");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var userRouter = require("./routes/user.route");
var hotelRouter = require("./routes/hotel.route");
var tourRouter = require("./routes/tour.route");
var itineraryRoutes = require("./routes/itinerary.route");
var itineraryDetailRoutes = require("./routes/itineraryDetail.routes");
var placeRoutes = require("./routes/place.route");
var tripRoutes = require("./routes/trip.route");
var descriptionRoutes = require("./routes/description.route");
var blogRoutes = require("./routes/blog.route");
var bookingRoutes = require("./routes/booking.route");
var tourMemberRoutes = require("./routes/tourMember.route");
var categoryRoutes = require("./routes/category.route");
var homeRouter = require("./routes/home.route");
var commentRoutes = require("./routes/comment.route");
var favoriteRoutes = require("./routes/favorite.route");
var saleRoutes = require("./routes/sale.route");

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(cors({
  origin: [
    'https://pickyourway.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use("/api/users", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/tours", tourRouter);
app.use("/api/itineraries", itineraryRoutes);
app.use("/api/itinerary-details", itineraryDetailRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/descriptions", descriptionRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/tour-members", tourMemberRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/home", homeRouter);
app.use("/api/comments", commentRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/sales", saleRoutes);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use((err, req, res, next) => {
  console.error("🔥 Lỗi hệ thống:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Lỗi server nội bộ!",
  });
});

module.exports = app;
