import mongoose, {Schema, Model} from 'mongoose';
import { IRestaurant } from '~/shared/interface';
import { RESTAURANT_STATUS_VALUES, RESTAURANT_STATUSES} from '~/shared/constant';

const RestaurantSchema: Schema = new Schema({
    // 1 chủ nhà hàng chỉ có 1 hàng hàng -> owner_id unique
    owner_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true},
    name: {type: String, required: true, unique: true},
    thumbnail: {type: String, require: true},
    phone: {type: String},
    status: {type: String, enum: RESTAURANT_STATUS_VALUES,  default: RESTAURANT_STATUSES.CLOSING}, /* trạng thái hoạt động của nhà hàng */
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
    rating: {type: Number, default: 0},
    rating_count: { type: Number, default: 0 }, // Number of reviews
    rating_sum: { type: Number, default: 0 }, // Sum of restaurant_service_rating
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