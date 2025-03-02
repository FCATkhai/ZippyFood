const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Cart = new Schema({
    customer_id: {
        type: Schema.Types.ObjectId
    },
    items: [{
        product_id: {
            type: Schema.Types.ObjectId
        },
        name: {
            type: Number
        },
        quantity: {
            type: Number
        },
        price: {
            type: Number
        }
    }],
    updatedAt: {
        type: Date
    }
});

module.exports = mongoose.model('Cart', Cart);