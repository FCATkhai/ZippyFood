import mongoose, { Schema, Model } from 'mongoose';
import { IProduct } from '~/shared/interface';

const ProductSchema: Schema = new Schema({
    /* Món ăn */
    restaurant_id: {
        type: Schema.Types.ObjectId, ref: "Restaurant", required: true
    },
    name: {
        type: String, require: true
    },
    description: {
        type: String
    },
    tags: [{
        type: String
    }] /* Lưu loại của món ăn để tìm kiếm */,
    image: {
        type: String, require: true
    },
    price: {
        type: Number, require: true
    },
    discount: {
        type: Number, default: 0, min: [0, 'The value of {PATH} ({VALUE}) must be greater than or equal 0']
    } /* */,
    final_price: {
        type: Number, require: true
    },
    status: {
        type: String, enum: ["available", "unavailable"], default: "available"
    },
    rating: {
        type: Number, default: 0
    },
    category_id: {
        type: Schema.Types.ObjectId, ref: "Category", required: true
    }
}, { timestamps: true });

// Tính toán final_price dựa trên price và discount trước khi lưu
ProductSchema.pre("save", function (this: IProduct, next) {
    if (this.discount) {
        if (this.discount < 1) {
            // giam theo ti le
            this.final_price = this.price * (1 - this.discount);
        } else {
            // giam truc tiep vao gia
            this.final_price = this.price - this.discount;
        }
    } else { // no discount
        this.final_price = this.price;
    }

    next();
});

const Product: Model<IProduct> = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;