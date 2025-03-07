import mongoose, {Schema, Model} from 'mongoose';
import { IUser } from '../config/interface';

const UserSchema: Schema = new Schema({
    /* Collection người dùng: Dùng chung cho các người dùng trong hệ thống */
    name: {
        type: String, required: true
    },
    email: {
        type: String, required: true, unique: true
    },
    password: {
        type: String, required: true
    },
    phone: {
        type: String, required: true
    },
    role: {
        type: String, require: true, enum: ['customer', 'restaurant_owner', 'admin'], default: 'customer'
    } /* vai trò của người dùng */,
    addresses: [{
        type: String
    }],
    status: {
        type: String, enum: ['active', 'banned'], default: 'active'
    }
});

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;

