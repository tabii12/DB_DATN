const Sale = require("../models/sale.model");

const createSale = async (req, res) => {
  try {
    const { tour_id, discount } = req.body;

    const sale = await Sale.create({
      tour_id,
      discount,
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.findAll();
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findById(id);

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.status(200).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.status(200).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findByIdAndDelete(id);

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.status(200).json({ message: "Sale deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  createSale,
  getAllSales,
  getSaleById,
  updateSaleById,
  deleteSaleById,
};
