const express = require("express");
const router = express.Router();

const serviceController = require("../controllers/service.controller");

router.post("/create", serviceController.createService);

router.get("/", serviceController.getAllServices);

router.get("/:id", serviceController.getServiceById);

router.put("/:id", serviceController.updateServiceById);

router.delete("/:id", serviceController.deleteServiceById);

module.exports = router;
