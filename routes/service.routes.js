const express = require("express");
const router = express.Router();

const serviceController = require("../controllers/service.controller");

/* =========================
   SERVICE ROUTES
========================= */

// GET ALL services
router.get("/", serviceController.getAllServices);

// CREATE service
router.post("/create", serviceController.createService);

// UPDATE service by slug
router.put("/:slug", serviceController.updateServiceBySlug);

// DELETE service by slug
router.delete("/:slug", serviceController.deleteServiceBySlug);

module.exports = router;
