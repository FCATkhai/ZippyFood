const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Restaurants = new Schema({
    owner_id: {
        type: Schema.Types.ObjectId
    },
    name: {
        type: String
    },
    thumbnail: {
        type: String
    },
    phone: {
        type: String
    },
    is_active: {
        type: Boolean
    } /* trạng thái hoạt động của nhà hàng */,
    open_hours: [{
        day: {
            type: String
        } /* thứ trong tuần */,
        time_slots: [{
            start: {
                type: String
            },
            end: {
                type: String
            }
        }] /* thời gian hoạt động theo khung giờ */
    }],
    status: {
        type: String
    } /* trạng thái phê duyệt của nhà hàng */,
    rating: {
        type: Number
    },
    createdAt: {
        type: Date
    },
    location: {
        address: {
            type: String
        } /* địa chỉ chi tiết của cửa hàng */,
        district: {
            type: String
        } /* Quận huyện */,
        province: {
            type: String
        } /* tỉnh thành */,
        province_code: {
            type: String
        } /* mã tỉnh */,
        coordinates: {
            lat: {
                type: Number
            } /* latitude */,
            lng: {
                type: Number
            } /* longitude */
        } /* vị trí geocoding */
    }
});

module.exports = mongoose.model('Restaurants', Restaurants);