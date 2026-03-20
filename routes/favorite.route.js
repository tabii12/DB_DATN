const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favorite.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/toggle", authMiddleware, favoriteController.toggleFavorite);

module.exports = router;