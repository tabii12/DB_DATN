const mongoose = require('mongoose');

const sub_categorySchema = new mongoose.Schema({
    name : {type: String, required : true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
});

const sub_categories = mongoose.model('sub_categories',sub_categorySchema);

module.exports = sub_categories;