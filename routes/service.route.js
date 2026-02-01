const express = require("express");
const router = express.Router();

const serviceController = require("../controllers/service.controller");

/* ======================================================
   SERVICE ROUTES
====================================================== */

// Create service
router.post("/create", serviceController.createService);

// Get all services
router.get("/", serviceController.getAllServices);

// Get service by id
router.get("/:id", serviceController.getServiceById);

// Update service by id
router.put("/:id", serviceController.updateServiceById);

// Delete service by id
router.delete("/:id", serviceController.deleteServiceById);

module.exports = router;
