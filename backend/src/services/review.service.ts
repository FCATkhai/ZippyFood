import { FilterQuery, Model, SortOrder, Types } from 'mongoose';
import { IReview, IRestaurant, IProduct } from "~/shared/interface";
import ReviewModel from '../models/Review.model';
import RestaurantModel from "../models/Restaurant.model";
import ProductModel from '../models/Product.model';
import { UpdateQuery } from 'mongoose';

//TODO: add transaction for update restaurant and product rating to ensure atomicity
interface PaginationOptions {
    page?: number;
    limit?: number;
    sort?: { [key: string]: SortOrder };
}

class ReviewService {
    private reviewModel: Model<IReview>;
    private restaurantModel: Model<IRestaurant>;
    private productModel: Model<IProduct>;

    constructor() {
        this.reviewModel = ReviewModel;
        this.restaurantModel = RestaurantModel;
        this.productModel = ProductModel;
    }

    /**
     * Update ratings for restaurant and product incrementally
     * @param restaurantId Restaurant ObjectId
     * @param productId Product ObjectId
     * @param operation 'increment' | 'decrement' | 'update'
     * @param ratings Optional ratings for update operation
     */
    private async updateRatings(
        restaurantId: Types.ObjectId,
        productId: Types.ObjectId,
        operation: 'increment' | 'decrement' | 'update',
        ratings?: {
            restaurant_service_rating?: number;
            product_rating?: number;
            old_restaurant_service_rating?: number;
            old_product_rating?: number;
        }
    ): Promise<void> {
        const restaurantUpdate: UpdateQuery<IRestaurant> = {};
        const productUpdate: UpdateQuery<IProduct> = {};

        if (operation === 'increment') {
            restaurantUpdate.$inc = { rating_count: 1, rating_sum: ratings!.restaurant_service_rating! };
            productUpdate.$inc = { rating_count: 1, rating_sum: ratings!.product_rating! };
        } else if (operation === 'decrement') {
            restaurantUpdate.$inc = { rating_count: -1, rating_sum: -ratings!.restaurant_service_rating! };
            productUpdate.$inc = { rating_count: -1, rating_sum: -ratings!.product_rating! };
        } else if (operation === 'update') {
            const restaurantRatingDiff =
                ratings!.restaurant_service_rating! - ratings!.old_restaurant_service_rating!;
            const productRatingDiff = ratings!.product_rating! - ratings!.old_product_rating!;
            restaurantUpdate.$inc = { rating_sum: restaurantRatingDiff };
            productUpdate.$inc = { rating_sum: productRatingDiff };
        }

        // Update restaurant
        await this.restaurantModel.updateOne({ _id: restaurantId }, restaurantUpdate);
        const updatedRestaurant = await this.restaurantModel.findById(restaurantId);
        if (updatedRestaurant) {
            const newRating =
                updatedRestaurant.rating_count > 0
                    ? Number((updatedRestaurant.rating_sum / updatedRestaurant.rating_count).toFixed(1))
                    : 0;
            await this.restaurantModel.updateOne({ _id: restaurantId }, { $set: { rating: newRating } });
        }

        // Update product
        await this.productModel.updateOne({ _id: productId }, productUpdate);
        const updatedProduct = await this.productModel.findById(productId);
        if (updatedProduct) {
            const newRating =
                updatedProduct.rating_count > 0
                    ? Number((updatedProduct.rating_sum / updatedProduct.rating_count).toFixed(1))
                    : 0;
            await this.productModel.updateOne({ _id: productId }, { $set: { rating: newRating } });
        }
    }

    /**
     * Create a new review and update related ratings
     * @param reviewData Review data
     * @returns Created review
     */
    async createReview(reviewData: Partial<IReview>): Promise<IReview> {
        try {
            const review = await this.reviewModel.create(reviewData);

            // Increment ratings for restaurant and product
            await this.updateRatings(review.restaurant_id, review.product_id, 'increment', {
                restaurant_service_rating: review.restaurant_service_rating,
                product_rating: review.product_rating,
            });

            return review;
        } catch (error) {
            throw new Error(`Failed to create review: ${(error as Error).message}`);
        }
    }

    /**
     * Get a review by ID
     * @param id Review ObjectId
     * @returns Review or null if not found
     */
    async getReviewById(id: Types.ObjectId): Promise<IReview | null> {
        try {
            const review = await this.reviewModel
                .findById(id)
                .populate('customer_id', 'name')
                .populate('product_id', 'name')
                .populate('restaurant_id', 'name');
            return review;
        } catch (error) {
            throw new Error(`Failed to get review: ${(error as Error).message}`);
        }
    }

    /**
     * Get reviews with filters and pagination
     * @param filters Query filters (restaurant_id, product_id, customer_id, rating)
     * @param options Pagination and sorting options
     * @returns Paginated list of reviews and metadata
     */
    async getReviews(
        filters: {
            restaurant_id?: Types.ObjectId;
            product_id?: Types.ObjectId;
            customer_id?: Types.ObjectId;
            rating?: number; // Filter by restaurant_service_rating or product_rating
        } = {},
        options: PaginationOptions = {}
    ): Promise<{
        reviews: IReview[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasMore: boolean;
    }> {
        try {
            const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;

            // Build filter query
            const query: FilterQuery<IReview> = {};
            if (filters.restaurant_id) query.restaurant_id = filters.restaurant_id;
            if (filters.product_id) query.product_id = filters.product_id;
            if (filters.customer_id) query.customer_id = filters.customer_id;
            if (filters.rating) {
                query.$or = [
                    { restaurant_service_rating: filters.rating },
                    { product_rating: filters.rating },
                ];
            }

            // Get total count
            const total = await this.reviewModel.countDocuments(query);

            // Fetch paginated reviews
            const reviews = await this.reviewModel
                .find(query)
                .populate('customer_id', 'name')
                .populate('product_id', 'name')
                .populate('restaurant_id', 'name')
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit);

            const totalPages = Math.ceil(total / limit);
            const hasMore = page * limit < total;

            return {
                reviews,
                total,
                page,
                limit,
                totalPages,
                hasMore,
            };
        } catch (error) {
            throw new Error(`Failed to get reviews: ${(error as Error).message}`);
        }
    }

    /**
     * Update a review by ID
     * @param id Review ObjectId
     * @param updateData Data to update
     * @returns Updated review or null if not found
     */
    async updateReview(id: Types.ObjectId, updateData: Partial<IReview>): Promise<IReview | null> {
        try {
            const oldReview = await this.reviewModel.findById(id);
            if (!oldReview) {
                throw new Error('Review not found');
            }

            const review = await this.reviewModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!review) {
                throw new Error('Review not found');
            }

            // Update ratings if ratings changed
            if (
                updateData.restaurant_service_rating !== undefined ||
                updateData.product_rating !== undefined
            ) {
                await this.updateRatings(review.restaurant_id, review.product_id, 'update', {
                    restaurant_service_rating:
                        updateData.restaurant_service_rating ?? review.restaurant_service_rating,
                    product_rating: updateData.product_rating ?? review.product_rating,
                    old_restaurant_service_rating: oldReview.restaurant_service_rating,
                    old_product_rating: oldReview.product_rating,
                });
            }

            return review;
        } catch (error) {
            throw new Error(`Failed to update review: ${(error as Error).message}`);
        }
    }

    /**
     * Delete a review by ID
     * @param id Review ObjectId
     * @returns Deleted review or null if not found
     */
    async deleteReview(id: Types.ObjectId): Promise<IReview | null> {
        try {
            const review = await this.reviewModel.findByIdAndDelete(id);

            if (!review) {
                throw new Error('Review not found');
            }

            // Decrement ratings for restaurant and product
            await this.updateRatings(review.restaurant_id, review.product_id, 'decrement', {
                restaurant_service_rating: review.restaurant_service_rating,
                product_rating: review.product_rating,
            });

            return review;
        } catch (error) {
            throw new Error(`Failed to delete review: ${(error as Error).message}`);
        }
    }
}

export default new ReviewService();