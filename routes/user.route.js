const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.get("/", userController.getAllUsers);

router.post("/register", userController.register);

router.post("/login", userController.login);

router.post("/google-auth", userController.googleAuth);

router.post("/verify-email", userController.verifyEmail);

router.get("/verify-email/:email/:code", userController.verifyEmail);

router.patch("/status/:id", userController.updateUserStatus);

module.exports = router;
