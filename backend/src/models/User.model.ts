import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from '~/shared/interface';

const UserSchema: Schema = new Schema({
    /* Collection người dùng: Dùng chung cho các người dùng trong hệ thống */
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    phone: {type: String, required: true, unique: true},
    role: {type: String, require: true, enum: ['customer', 'restaurant_owner', 'admin'], default: 'customer'} /* vai trò của người dùng */,
    addresses: [{type: String}],
    status: {type: String, enum: ['active', 'banned'], default: 'active'}
});

/** Hash password before saving */
UserSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

/** Compare password */
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;

