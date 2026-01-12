const express = require("express");
const router = express.Router();

const {
  register,
  verifyEmail,
} = require("../controllers/user.controller");

router.post("/register", register);
router.post("/verify-email", verifyEmail);

module.exports = router;