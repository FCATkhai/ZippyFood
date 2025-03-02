const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Product = new Schema({
    /* Món ăn */
    restaurant_id: {
        type: Schema.Types.ObjectId
    },
    name: {
        type: String
    },
    description: {
        type: String
    },
    tags: [{
        type: String
    }] /* Lưu loại của món ăn để tìm kiếm */,
    image: {
        type: String
    },
    price: {
        type: Number
    },
    discount: {
        type: Number
    },
    final_price: {
        type: Number
    },
    status: {
        type: String
    },
    rating: {
        type: Number
    },
    category_id: {
        type: Schema.Types.ObjectId
    }
});

module.exports = mongoose.model('Product', Product);