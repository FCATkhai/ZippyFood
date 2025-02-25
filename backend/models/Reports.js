const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Reports = new Schema({
    /* thống kê về hoạt động kinh doanh của nhà hàng */
    restaurant_id: {
        type: Schema.Types.ObjectId
    },
    date: {
        type: Date
    },
    total_orders: {
        type: Number
    },
    total_revenue: {
        type: Number
    },
    top_selling: [{
        product_id: {
            type: Schema.Types.ObjectId
        },
        name: {
            type: String
        },
        total_sold: {
            type: Number
        },
        Products_category_id: {
            type: Schema.Types.ObjectId
        }
    }]
});

module.exports = mongoose.model('Reports', Reports);