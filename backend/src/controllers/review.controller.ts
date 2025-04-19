import { Request, Response, NextFunction } from 'express';
import { SortOrder, Types } from 'mongoose';
import ReviewService from '../services/review.service';
import { IReview } from '~/shared/interface';
import { USER_ROLES } from '../config/constants';
import orderService from '../services/order.service';
import { ORDER_STATUSES } from '~/shared/constant';

/**
 * Tạo đánh giá mới
 * @route POST /api/reviews
 * @access Private (Chỉ user đã đăng nhập)
 */
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        const userRole = req.user?.role;

        const {
            product_id,
            restaurant_id,
            order_id,
            restaurant_service_rating,
            product_rating,
            review_text, // Optional
        } = req.body;

        const imageUrl = req.file?.path || null;

        if (!Types.ObjectId.isValid(product_id)) {
            res.status(400);
            throw new Error('invalid product_id');
        }
        if (!Types.ObjectId.isValid(restaurant_id)) {
            res.status(400);
            throw new Error('invalid restaurant_id');
        }
        if (!Types.ObjectId.isValid(order_id)) {
            res.status(400);
            throw new Error('invalid order_id');
        }

        const reviewData: Partial<IReview> = {
            customer_id: userId,
            product_id,
            restaurant_id,
            order_id,
            restaurant_service_rating,
            product_rating,
            review_text,
            image: imageUrl, // Optional
        };

        const review = await ReviewService.createReview(reviewData);

        // update order status
        await orderService.updateOrderStatus(order_id, ORDER_STATUSES.REVIEWED, userId, userRole);

        res.status(201).json({
            success: true,
            message: 'Đánh giá đã được tạo thành công',
            review,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy đánh giá theo ID
 * @route GET /api/reviews/:id
 * @access Public
 */
export const getReviewById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const review = await ReviewService.getReviewById(new Types.ObjectId(id));
        if (!review) {
            res.status(404);
            throw new Error('Không tìm thấy đánh giá');
        }

        res.json({
            success: true,
            message: 'Lấy đánh giá thành công',
            review,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy danh sách đánh giá với phân trang và bộ lọc
 * @route GET /api/reviews
 * @access Public
 */
export const getReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const {
            restaurant_id,
            product_id,
            customer_id,
            rating,
            page = 1,
            limit = 10,
            sort = 'desc',
        } = req.query;

        const filters: {
            restaurant_id?: Types.ObjectId;
            product_id?: Types.ObjectId;
            customer_id?: Types.ObjectId;
            rating?: number;
        } = {};
        if (restaurant_id) filters.restaurant_id = new Types.ObjectId(restaurant_id as string);
        if (product_id) filters.product_id = new Types.ObjectId(product_id as string);
        if (customer_id) filters.customer_id = new Types.ObjectId(customer_id as string);
        if (rating) filters.rating = Number(rating);

        const sortOption: { [key: string]: SortOrder } = { createdAt: sort === "desc" ? -1 : 1 };
        const options = {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            sort: sortOption,
        };

        const result = await ReviewService.getReviews(filters, options);

        res.json({
            success: true,
            message: 'Lấy danh sách đánh giá thành công',
            reviews: result.reviews,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
                hasMore: result.hasMore,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cập nhật đánh giá
 * @route PATCH /api/reviews/:id
 * @access Private (Chỉ user sở hữu hoặc admin)
 */
export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const {
            restaurant_service_rating,
            product_rating,
            review_text, // Optional
        } = req.body;
        const imageUrl = req.file?.path || null;

        const review = await ReviewService.getReviewById(new Types.ObjectId(id));
        if (!review) {
            res.status(404);
            throw new Error('Không tìm thấy đánh giá');
        }

        if (review.customer_id.toString() !== userId.toString() && req.user?.role !== USER_ROLES.ADMIN) {
            res.status(403);
            throw new Error('Bạn không có quyền cập nhật đánh giá này');
        }

        const updateData: Partial<IReview> = {};
        if (restaurant_service_rating) updateData.restaurant_service_rating = restaurant_service_rating;
        if (product_rating) updateData.product_rating = product_rating;
        if (review_text !== undefined) updateData.review_text = review_text;
        if (imageUrl !== null) updateData.image = imageUrl;

        const updatedReview = await ReviewService.updateReview(new Types.ObjectId(id), updateData);
        if (!updatedReview) {
            res.status(404);
            throw new Error('Không tìm thấy đánh giá');
        }

        res.json({
            success: true,
            message: 'Cập nhật đánh giá thành công',
            review: updatedReview,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Xóa đánh giá
 * @route DELETE /api/reviews/:id
 * @access Private (Chỉ user sở hữu hoặc admin)
 */
export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const review = await ReviewService.getReviewById(new Types.ObjectId(id));
        if (!review) {
            res.status(404);
            throw new Error('Không tìm thấy đánh giá');
        }

        if (review.customer_id.toString() !== userId.toString() && req.user?.role !== 'admin') {
            res.status(403);
            throw new Error('Bạn không có quyền xóa đánh giá này');
        }

        await ReviewService.deleteReview(new Types.ObjectId(id));

        res.json({
            success: true,
            message: 'Xóa đánh giá thành công',
        });
    } catch (error) {
        next(error);
    }
};