const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotel.controller");

router.post("/create", hotelController.createHotel);

router.get("/", hotelController.getAllHotels);

router.get("/detail/:slug", hotelController.getHotelBySlug);

router.put("/update/:slug", hotelController.updateHotel);

router.patch("/status/:slug", hotelController.updateHotelStatus);

module.exports = router;
