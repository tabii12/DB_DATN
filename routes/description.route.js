const express = require("express");
const router = express.Router();
const descriptionController = require("../controllers/description.controller");

router.post("/create", descriptionController.createDescription);
router.get("/tour/:tour_id", descriptionController.getDescriptionsByTour);
router.put("/:id", descriptionController.updateDescriptionById);
router.delete("/:id", descriptionController.deleteDescriptionById);

module.exports = router;
