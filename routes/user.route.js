const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { primaryAuth } = require("../middlewares/auth.middleware");

router.get("/", userController.getAllUsers);

router.post("/register", userController.register);

router.post("/login", userController.login);

router.post("/google-auth", userController.googleAuth);

router.post("/verify-email", userController.verifyEmail);

router.get("/verify-email/:email/:code", userController.verifyEmail);

router.patch("/status/:id", userController.updateUserStatus);

router.put("/change-password", primaryAuth, userController.changePassword);

router.get("/:id", userController.getUserById);

module.exports = router;
