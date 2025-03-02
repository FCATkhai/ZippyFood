const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Notification = new Schema({
    user_id: {
        type: String
    },
    title: {
        type: String
    },
    content: {
        type: String
    },
    url: {
        type: String
    },
    is_read: {
        type: Boolean
    },
    createdAt: {
        type: Date
    }
});

module.exports = mongoose.model('Notification', Notification);