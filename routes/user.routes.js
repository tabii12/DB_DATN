const express = require("express");
const router = express.Router();

const {
  register,
  verifyEmail,
  login,
} = require("../controllers/user.controller");

router.post("/register", register);
router.post("/verify-email", verifyEmail); 
router.get("/verify-email/:email/:code", verifyEmail);
router.post("/login", login);

module.exports = router;