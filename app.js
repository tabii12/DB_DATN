require("dotenv").config();

var cors = require("cors");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index.route");
var userRouter = require("./routes/user.route");
var hotelRouter = require("./routes/hotel.route");
var tourRouter = require("./routes/tour.route");
var itineraryRoutes = require("./routes/itinerary.route");
var itineraryDetailRoutes = require("./routes/itineraryDetail.routes");
var itineraryServiceRoutes = require("./routes/itineraryService.routes");
var serviceRoutes = require("./routes/service.route");
var placeRoutes = require("./routes/place.route");
var tripRoutes = require("./routes/trip.route");
var descriptionRoutes = require("./routes/description.route");
var blogRoutes = require("./routes/blog.route");
var reviewRoutes = require("./routes/review.route");
var bookingRoutes = require("./routes/booking.route");
var tourMemberRoutes = require("./routes/tourMember.route");
var categoryRoutes = require("./routes/category.route");

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/", indexRouter);
app.use("/api/users", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/tours", tourRouter);
app.use("/api/itineraries", itineraryRoutes);
app.use("/api/itinerary-details", itineraryDetailRoutes);
app.use("/api/itinerary-services", itineraryServiceRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/descriptions", descriptionRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/tour-members", tourMemberRoutes);
app.use("/api/categories", categoryRoutes);

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
