import mongoose, { Schema, Model } from "mongoose";
import { IReview } from "~/shared/interface";

const ReviewSchema = new Schema(
    {
        customer_id: {
            type: Schema.Types.ObjectId,
            ref: 'User', 
            required: true,
        },
        product_id: {
            type: Schema.Types.ObjectId,
            ref: 'Product', 
            required: true,
        },
        restaurant_id: {
            type: Schema.Types.ObjectId,
            ref: 'Restaurant', 
            required: true,
        },
        order_id: {
            type: Schema.Types.ObjectId,
            ref: 'Order', 
            required: true,
        },
        restaurant_service_rating: {
            type: Number,
            enum: [1, 2, 3, 4, 5],
            required: true,
        },
        product_rating: {
            type: Number,
            enum: [1, 2, 3, 4, 5],
            required: true,
        },
        review_text: {
            type: String,
            trim: true,
            minlength: 1,
            maxlength: 500, 
        },
        image: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

// Export the model
const Review: Model<IReview> = mongoose.model<IReview>('Review', ReviewSchema);
export default Review;