const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favorite.controller");
const { primaryAuth } = require("../middlewares/auth.middleware");

router.post("/toggle", primaryAuth, favoriteController.toggleFavorite);

router.get("/my-favorites", primaryAuth, favoriteController.getMyFavorites);

module.exports = router;