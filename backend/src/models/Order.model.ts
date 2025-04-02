import mongoose, {Schema, Model} from 'mongoose';
import { IOrder } from '~/shared/interface';
const OrderSchema: Schema = new Schema({
    customer_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    restaurant_id: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
    products: [
        {
            product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            subtotal: { type: Number, required: true },
        },
    ],
    total_price: { type: Number, required: true },
    address: { type: String, required: true },
    note: { type: String },
    status: { type: String, enum: ["pending", "processing", "ordering", "completed", "cancelled"], default: "pending" },
    order_date: { type: Date, default: Date.now },
}, { timestamps: true });

const Order: Model<IOrder> = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;