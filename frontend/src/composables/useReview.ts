import { ref, computed } from 'vue';
import {
    createReview,
    getReviewById,
    getReviews,
    updateReview,
    deleteReview,
} from '@/api/review.api';
import type { IReview } from '~/shared/interface';

interface IApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T; // Single review
    reviews?: T[]; // Array of reviews
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasMore: boolean;
    };
}

export function useReview() {
    const reviews = ref<IReview[]>([]);
    const review = ref<IReview | null>(null);
    const total = ref<number>(0);
    const page = ref<number>(1);
    const limit = ref<number>(10);
    const totalPages = ref<number>(0);
    const hasMore = ref<boolean>(false);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    /**
     * Lấy danh sách đánh giá với phân trang và bộ lọc
     */
    async function fetchReviews(
        p: number = 1,
        l: number = 10,
        restaurant_id?: string,
        product_id?: string,
        customer_id?: string,
        rating?: number,
        sort: 'asc' | 'desc' = 'desc'
    ) {
        loading.value = true;
        error.value = null;
        try {
            const response: IApiResponse<IReview> = await getReviews(
                p,
                l,
                restaurant_id,
                product_id,
                customer_id,
                rating,
                sort
            );
            if (response.success) {
                reviews.value = response.reviews || [];
                total.value = response.pagination?.total || 0;
                page.value = response.pagination?.page || p;
                limit.value = response.pagination?.limit || l;
                totalPages.value = response.pagination?.totalPages || 0;
                hasMore.value = response.pagination?.hasMore || false;
            } else {
                throw new Error(response.message || 'Không thể lấy danh sách đánh giá');
            }
        } catch (err: any) {
            error.value = err.message || 'Lỗi khi lấy danh sách đánh giá';
            reviews.value = [];
        } finally {
            loading.value = false;
        }
    }

    /**
     * Lấy đánh giá theo ID
     */
    async function fetchReviewById(id: string) {
        loading.value = true;
        error.value = null;
        try {
            const response: IApiResponse<IReview> = await getReviewById(id);
            if (response.success && response.data) {
                review.value = response.data;
            } else {
                throw new Error(response.message || 'Không thể lấy đánh giá');
            }
        } catch (err: any) {
            error.value = err.message || 'Lỗi khi lấy đánh giá';
            review.value = null;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Tạo đánh giá mới
     */
    async function create(data: {
        product_id: string;
        restaurant_id: string;
        order_id: string;
        restaurant_service_rating: number;
        product_rating: number;
        review_text?: string;
        image?: File;
    }) {
        loading.value = true;
        error.value = null;
        try {
            const response: IApiResponse<IReview> = await createReview(data);
            if (response.success && response.data) {
                review.value = response.data;
                // Add to the list if on the first page and no conflicting filters
                if (
                    page.value === 1 &&
                    (!data.restaurant_id || !reviews.value.length || reviews.value[0].restaurant_id === data.restaurant_id)
                ) {
                    reviews.value.unshift(response.data);
                    total.value += 1;
                }
            } else {
                throw new Error(response.message || 'Không thể tạo đánh giá');
            }
        } catch (err: any) {
            error.value = err.message || 'Lỗi khi tạo đánh giá';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Cập nhật đánh giá
     */
    async function update(
        id: string,
        data: {
            restaurant_service_rating?: number;
            product_rating?: number;
            review_text?: string;
            image?: File | null;
        }
    ) {
        loading.value = true;
        error.value = null;
        try {
            const response: IApiResponse<IReview> = await updateReview(id, data);
            if (response.success && response.data) {
                review.value = response.data;
                // Update the review in the list if it exists
                const index = reviews.value.findIndex((r) => r._id === id);
                if (index !== -1) {
                    reviews.value[index] = response.data;
                }
            } else {
                throw new Error(response.message || 'Không thể cập nhật đánh giá');
            }
        } catch (err: any) {
            error.value = err.message || 'Lỗi khi cập nhật đánh giá';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Xóa đánh giá
     */
    async function deleteReviewById(id: string) {
        loading.value = true;
        error.value = null;
        try {
            const response: IApiResponse<IReview> = await deleteReview(id);
            if (response.success) {
                reviews.value = reviews.value.filter((r) => r._id !== id);
                total.value -= 1;
                if (review.value?._id === id) {
                    review.value = null;
                }
            } else {
                throw new Error(response.message || 'Không thể xóa đánh giá');
            }
        } catch (err: any) {
            error.value = err.message || 'Lỗi khi xóa đánh giá';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Đặt lại trạng thái reactive
     */
    function reset() {
        reviews.value = [];
        review.value = null;
        total.value = 0;
        page.value = 1;
        limit.value = 10;
        totalPages.value = 0;
        hasMore.value = false;
        loading.value = false;
        error.value = null;
    }

    return {
        reviews: computed(() => reviews.value),
        review: computed(() => review.value),
        total: computed(() => total.value),
        page: computed(() => page.value),
        limit: computed(() => limit.value),
        totalPages: computed(() => totalPages.value),
        hasMore: computed(() => hasMore.value),
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        fetchReviews,
        fetchReviewById,
        create,
        update,
        deleteReviewById,
        reset,
    };
}
