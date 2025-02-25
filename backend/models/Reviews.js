const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Reviews = new Schema({
    /* Đánh giá món ăn */
    customer_id: {
        type: Schema.Types.ObjectId
    },
    product_id: {
        type: Schema.Types.ObjectId
    },
    rating: {
        type: Number
    },
    review_text: {
        type: String
    },
    image: {
        type: String
    },
    createdAt: {
        type: Date
    },
    Products_category_id: {
        type: Schema.Types.ObjectId
    }
});

module.exports = mongoose.model('Reviews', Reviews);