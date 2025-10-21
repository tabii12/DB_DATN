const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer();

const { 
    createUser, 
    loginUser 
} = require("../controllers/userController");

router.post("/register", upload.none(), createUser);

router.post("/login", upload.none(), loginUser);

module.exports = router;
