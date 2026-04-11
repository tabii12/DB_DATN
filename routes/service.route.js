const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/service.controller");

// Các API này thường dành cho ADMIN quản lý kho dịch vụ
router.post("/create", serviceController.createService);
router.get("/all", serviceController.getAllServices);
router.get("/:id", serviceController.getServiceById);
router.put("/update/:id", serviceController.updateService);
router.delete("/:id", serviceController.deleteService);

module.exports = router;
