import mongoose, {Schema, Model} from 'mongoose';
import { IRestaurant } from '~/shared/interface';

const RestaurantSchema: Schema = new Schema({
    // 1 chủ nhà hàng chỉ có 1 hàng hàng -> owner_id unique
    owner_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true},
    name: {type: String, required: true, unique: true},
    thumbnail: {type: String, require: true},
    phone: {type: String},
    is_active: {type: Boolean, default: false} /* trạng thái hoạt động của nhà hàng */,
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