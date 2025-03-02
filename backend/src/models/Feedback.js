const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Feedback = new Schema({
    user_id: {
        type: Schema.Types.ObjectId
    },
    content: {
        type: String
    },
    type: {
        type: String
    },
    related_type: {
        type: String
    } /* đi kèm với related_id để biết related_id thuộc loại nào  */,
    related_id: {
        type: Schema.Types.ObjectId
    } /* id của document cần phản hồi */,
    status: {
        type: String
    },
    createdAt: {
        type: Date
    },
    ResolvedAd: {
        type: Date
    },
    reply: {
        type: String
    }
});

module.exports = mongoose.model('Feedback', Feedback);