const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Orders = new Schema({
    customer_id: {
        type: Schema.Types.ObjectId
    },
    restaurant_id: {
        type: Schema.Types.ObjectId
    },
    products: [{
        product_id: {
            type: Schema.Types.ObjectId
        },
        name: {
            type: String
        },
        quantity: {
            type: Number
        },
        price: {
            type: Number
        },
        subtotal: {
            type: Number
        },
        Products_category_id: {
            type: Schema.Types.ObjectId
        }
    }],
    total_price: {
        type: Number
    },
    address: {
        type: String
    },
    note: {
        type: String
    },
    status: {
        type: String
    },
    order_date: {
        type: Date
    }
});

module.exports = mongoose.model('Orders', Orders);