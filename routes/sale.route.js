const express = require("express");
const router = express.Router();
const saleController = require("../controllers/sale.controller");

router.post("/create", saleController.createSale);
router.get("/", saleController.getAllSales);
router.get("/:id", saleController.getSaleById);
router.put("/:id", saleController.updateSaleById);
router.delete("/:id", saleController.deleteSaleById);

module.exports = router;