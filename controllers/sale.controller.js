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

