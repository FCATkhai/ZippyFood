import mongoose, {Schema, Model} from 'mongoose';
import { IRestaurantApplication } from "../config/interface";

/* lưu thông tin đăng ký mở nhà hàng */
const RestaurantApplicationSchema = new Schema<IRestaurantApplication>({
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    restaurant_name: { type: String, required: true },
    owner_name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    identify_document: { type: String, required: true }, // căn cước công dân
    business_license: { type: String, required: true }, // giấy phép kinh doanh
    food_safety_certificate: { type: String, required: true }, // giấy chứng nhận an toàn thực phẩm
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
}, { timestamps: true });

const RestaurantApplication: Model<IRestaurantApplication> = mongoose.model("RestaurantApplication", RestaurantApplicationSchema);
export default RestaurantApplication;