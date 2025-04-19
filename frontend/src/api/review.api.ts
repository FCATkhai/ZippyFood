import axios from '@/utils/axios';
import type { IReview } from '~/shared/interface';

// Interface for API responses
interface IApiResponse<T> {
    success: boolean;
    message?: string;
    review?: T; // Single review
    reviews?: T[]; // Array of reviews
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasMore: boolean;
    };
}

// Base URL for review endpoints
const API_URL = '/reviews';

/**
 * Tạo đánh giá mới
 * @param data Review data (bao gồm file ảnh nếu có)
 * @returns Đánh giá đã được tạo
 */
export const createReview = async (data: {
    product_id: string;
    restaurant_id: string;
    order_id: string;
    restaurant_service_rating: number;
    product_rating: number;
    review_text?: string;
    image?: File; // Optional image file
}) => {
    const formData = new FormData();
    formData.append('product_id', data.product_id);
    formData.append('restaurant_id', data.restaurant_id);
    formData.append('order_id', data.order_id);
    formData.append('restaurant_service_rating', data.restaurant_service_rating.toString());
    formData.append('product_rating', data.product_rating.toString());
    if (data.review_text) formData.append('review_text', data.review_text);
    if (data.image) formData.append('file', data.image);

    const res = await axios.post<IApiResponse<IReview>>(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

/**
 * Lấy đánh giá theo ID
 * @param id Review ID
 * @returns Đánh giá tương ứng
 */
export const getReviewById = async (id: string) => {
    const res = await axios.get<IApiResponse<IReview>>(`${API_URL}/${id}`);
    return res.data;
};

/**
 * Lấy danh sách đánh giá với phân trang và bộ lọc
 * @param page Số trang (mặc định: 1)
 * @param limit Số mục mỗi trang (mặc định: 10)
 * @param restaurant_id Lọc theo ID nhà hàng (tùy chọn)
 * @param product_id Lọc theo ID sản phẩm (tùy chọn)
 * @param customer_id Lọc theo ID khách hàng (tùy chọn)
 * @param rating Lọc theo đánh giá (1-5, tùy chọn)
 * @param sort Sắp xếp theo trường (mặc định: createdAt desc)
 * @returns Danh sách đánh giá phân trang
 */
export const getReviews = async (
    page: number = 1,
    limit: number = 10,
    restaurant_id?: string,
    product_id?: string,
    customer_id?: string,
    rating?: number,
    sort: string = 'desc'
) => {
    const params: Record<string, string | number> = { page, limit, sort };
    if (restaurant_id) params.restaurant_id = restaurant_id;
    if (product_id) params.product_id = product_id;
    if (customer_id) params.customer_id = customer_id;
    if (rating !== undefined) params.rating = rating;

    const res = await axios.get<IApiResponse<IReview>>(API_URL, { params });
    return res.data;
};

/**
 * Cập nhật đánh giá
 * @param id Review ID
 * @param data Dữ liệu cập nhật (bao gồm file ảnh nếu có)
 * @returns Đánh giá đã được cập nhật
 */
export const updateReview = async (
    id: string,
    data: {
        restaurant_service_rating?: number;
        product_rating?: number;
        review_text?: string;
        image?: File | null; // null to clear image
    }
) => {
    const formData = new FormData();
    if (data.restaurant_service_rating !== undefined)
        formData.append('restaurant_service_rating', data.restaurant_service_rating.toString());
    if (data.product_rating !== undefined)
        formData.append('product_rating', data.product_rating.toString());
    if (data.review_text !== undefined) formData.append('review_text', data.review_text);
    if (data.image !== undefined) formData.append('file', data.image || '');

    const res = await axios.patch<IApiResponse<IReview>>(`${API_URL}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

/**
 * Xóa đánh giá
 * @param id Review ID
 * @returns Thông báo xóa thành công
 */
export const deleteReview = async (id: string) => {
    const res = await axios.delete<IApiResponse<IReview>>(`${API_URL}/${id}`);
    return res.data;
};
