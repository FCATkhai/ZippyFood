const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = new Schema({
    /* Collection người dùng: Dùng chung cho các người dùng trong hệ thống */
    name: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    phone: {
        type: String
    },
    role: {
        type: String
    } /* vai trò của người dùng */,
    addresses: [{
        type: String
    }],
    status: {
        type: String
    }
});

module.exports = mongoose.model('User', User);