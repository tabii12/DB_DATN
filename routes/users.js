const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer();

const { 
    createUser, 
    loginUser 
} = require("../controllers/userController");

router.post("/register", createUser);

router.post("/login", loginUser);

module.exports = router;
