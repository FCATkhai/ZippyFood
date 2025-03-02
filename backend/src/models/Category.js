const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Category = new Schema({
    /* Giúp chủ nhà hàng tạo và quản lý nhóm món ăn */
    restaurant_id: {
        type: Schema.Types.ObjectId
    },
    name: {
        type: String
    },
    description: {
        type: String
    }
});

module.exports = mongoose.model('Category', Category);