const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { primaryAuth } = require("../middlewares/auth.middleware");

// ===== PUBLIC ROUTES =====
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/google-auth", userController.googleAuth);

router.post("/verify-email", userController.verifyEmail);
router.get("/verify-email/:email/:code", userController.verifyEmail);

// ===== PROTECTED ROUTES =====
router.get("/", primaryAuth, userController.getAllUsers);
router.patch("/update/:id", primaryAuth, userController.updateUser);
router.put("/change-password", primaryAuth, userController.changePassword);

// ===== LAST: DYNAMIC ROUTE =====
router.get("/:id", primaryAuth, userController.getUserById);

module.exports = router;