import mongoose, {Schema, Model} from 'mongoose';
import { ICart } from '~/shared/interface';
const CartSchema: Schema = new Schema({
    customer_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true }
        }
    ]
}, { timestamps: true });

const Cart: Model<ICart> = mongoose.model<ICart>('Cart', CartSchema);
export default Cart;