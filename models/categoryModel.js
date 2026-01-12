//Tạo cấu trúc schema cho dữ liệu categories
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name : {type: String, required : true }
});

const categories = mongoose.model('categories',categorySchema);

module.exports = categories;