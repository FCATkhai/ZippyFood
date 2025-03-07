import mongoose, {Schema, Model} from 'mongoose';
import { IRestaurant } from '../config/interface';

const RestaurantSchema: Schema = new Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    },
    name: {
        type: String, required: true
    },
    thumbnail: {
        type: String
    },
    phone: {
        type: String
    },
    is_active: {
        type: Boolean, default: false
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
    // TODO: đưa status vào collection RestaurantApplication
    // status: {
    //     type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending'
    // } /* trạng thái phê duyệt của nhà hàng */,
    rating: {
        type: Number
    },
    createdAt: {
        type: Date, default: Date.now
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
    },
}, 
{timestamps: true});

const Restaurant:Model<IRestaurant> = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
export default Restaurant;