const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const RestaurantApplications = new Schema({
    /* lưu thông tin đăng ký mở nhà hàng */
    user_id: {
        type: Schema.Types.ObjectId
    },
    restaurant_name: {
        type: String
    },
    owner_name: {
        type: String
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    identify_document: {
        type: String
    },
    business_license: {
        type: String
    },
    food_safety_certificate: {
        type: String
    },
    status: {
        type: String
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
});

module.exports = mongoose.model('RestaurantApplications', RestaurantApplications);