const Product = require("../models/productModel");

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("sub_category");
        res.status(200).json(products);
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id).populate("sub_category");

        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm theo ID:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
};