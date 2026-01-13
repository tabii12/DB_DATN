const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const hotelController = require("../controllers/hotel.controller");

router.post("/create", upload.array("images", 5), hotelController.createHotel);

router.get("/", hotelController.getAllHotels);
router.get("/detail/:slug", hotelController.getHotelBySlug);

router.put("/update/:slug", upload.array("images", 5), hotelController.updateHotel);

router.delete("/image/:imageId", hotelController.deleteHotelImage);

router.patch("/status/:slug", hotelController.updateHotelStatus);

module.exports = router;