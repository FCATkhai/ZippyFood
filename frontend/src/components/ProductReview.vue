<template>
    <div class="product-reviews">
        <!-- Header with stats -->
        <div class="stats shadow mb-6 w-full">
            <div class="stat">
                <div class="stat-title">Đánh giá</div>
                <div class="stat-value">{{ averageRating }}</div>
                <div class="stat-desc flex items-center">
                    <div class="rating rating-sm mr-2">
                        <input type="radio" class="mask mask-star-2 bg-orange-400" checked disabled />
                        <input type="radio" class="mask mask-star-2 bg-orange-400" :checked="averageRating >= 2"
                            disabled />
                        <input type="radio" class="mask mask-star-2 bg-orange-400" :checked="averageRating >= 3"
                            disabled />
                        <input type="radio" class="mask mask-star-2 bg-orange-400" :checked="averageRating >= 4"
                            disabled />
                        <input type="radio" class="mask mask-star-2 bg-orange-400" :checked="averageRating >= 5"
                            disabled />
                    </div>
                    <span>{{ total }} đánh giá</span>
                </div>
            </div>

            <div class="stat">
                <div class="stat-title">Điểm đánh giá dịch vụ</div>
                <div class="stat-value">{{ averageServiceRating }}</div>
                <div class="stat-desc">
                    <div class="rating rating-sm">
                        <input type="radio" class="mask mask-star-2 bg-orange-400" checked disabled />
                        <input type="radio" class="mask mask-star-2 bg-orange-400" :checked="averageServiceRating >= 2"
                            disabled />
                        <input type="radio" class="mask mask-star-2 bg-orange-400" :checked="averageServiceRating >= 3"
                            disabled />
                        <input type="radio" class="mask mask-star-2 bg-orange-400" :checked="averageServiceRating >= 4"
                            disabled />
                        <input type="radio" class="mask mask-star-2 bg-orange-400" :checked="averageServiceRating >= 5"
                            disabled />
                    </div>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-4 mb-6">
            <div class="form-control">
                <label class="label cursor-pointer gap-2">
                    <span class="label-text">Tất cả</span>
                    <input type="radio" class="radio radio-sm radio-primary" :checked="selectedRating === 0"
                        @change="setRatingFilter(0)" />
                </label>
            </div>
            <div class="form-control" v-for="rating in 5" :key="rating">
                <label class="label cursor-pointer gap-2">
                    <span class="label-text">{{ rating }} sao</span>
                    <input type="radio" class="radio radio-sm radio-primary" :checked="selectedRating === rating"
                        @change="setRatingFilter(rating)" />
                </label>
            </div>

            <div class="form-control ml-auto">
                <label class="label">
                    <span class="label-text">Sắp xếp</span>
                </label>
                <select class="select select-bordered select-sm" v-model="sortOrder" @change="loadReviews()">
                    <option value="desc">Mới nhất trước</option>
                    <option value="asc">Cũ nhất trước</option>
                </select>
            </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center items-center py-8">
            <div class="loading loading-spinner loading-lg"></div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="alert alert-error shadow-lg">
            <div>
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>{{ error }}</span>
            </div>
        </div>

        <!-- No reviews -->
        <div v-else-if="reviews.length === 0" class="alert alert-info shadow-lg">
            <div>
                <i class="fa-solid fa-info-circle"></i>
                <span>Chưa có đánh giá nào cho sản phẩm này.</span>
            </div>
        </div>

        <!-- Reviews list -->
        <div v-else class="space-y-6">
            <div v-for="(review, index) in reviews" :key="index" class="card bg-base-100 shadow-xl">
                <div class="card-body">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="font-bold">Khách hàng</div>
                            <div class="text-sm opacity-70">{{ formatDate(review.createdAt) }}</div>
                        </div>
                        <div>
                            <div class="badge badge-lg">Đánh giá món: {{ review.product_rating }} <i
                                    class="fa-solid fa-star text-yellow-400 ml-1"></i></div>
                            <div class="badge badge-lg ml-2">Đánh giá dịch vụ: {{ review.restaurant_service_rating }} <i
                                    class="fa-solid fa-star text-yellow-400 ml-1"></i></div>
                        </div>
                    </div>

                    <div class="divider my-2"></div>

                    <div v-if="review.review_text" class="mb-4">
                        <p>{{ review.review_text }}</p>
                    </div>

                    <div v-if="review.image" class="mt-2">
                        <figure>
                            <img :src="review.image" alt="Hình ảnh đánh giá"
                                class="rounded-lg max-h-64 object-contain" />
                        </figure>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center mt-8">
            <div class="btn-group">
                <button class="btn" :class="{ 'btn-disabled': page === 1 }" @click="changePage(page - 1)">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>

                <button class="btn" v-for="p in paginationRange" :key="p" :class="{ 'btn-active': p === page }"
                    @click="changePage(p)">
                    {{ p }}
                </button>

                <button class="btn" :class="{ 'btn-disabled': page === totalPages }" @click="changePage(page + 1)">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>
        </div>

        <!-- Load more button -->
        <div v-if="hasMore" class="flex justify-center mt-8">
            <button class="btn btn-primary" @click="loadMore" :disabled="loading">
                <i class="fa-solid fa-spinner mr-2" v-if="loading"></i>
                {{ loading ? 'Đang tải...' : 'Xem thêm đánh giá' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useReview } from '@/composables/useReview';

// Props
const props = defineProps({
    productId: {
        type: String,
        required: true
    },
    perPage: {
        type: Number,
        default: 5
    }
});

// Use review composable
const {
    reviews,
    total,
    page,
    limit,
    totalPages,
    hasMore,
    loading,
    error,
    fetchReviews
} = useReview();

// Local state
const selectedRating = ref(0);
const sortOrder = ref('desc');

// Computed properties
const averageRating = computed(() => {
    if (!reviews.value || reviews.value.length === 0) return '0.0';

    const sum = reviews.value.reduce((acc, review) => acc + review.product_rating, 0);
    return (sum / reviews.value.length).toFixed(1);
});

const averageServiceRating = computed(() => {
    if (!reviews.value || reviews.value.length === 0) return '0.0';

    const sum = reviews.value.reduce((acc, review) => acc + review.restaurant_service_rating, 0);
    return (sum / reviews.value.length).toFixed(1);
});

const paginationRange = computed(() => {
    const range = [];
    const maxVisiblePages = 5;

    if (totalPages.value <= maxVisiblePages) {
        // Show all pages
        for (let i = 1; i <= totalPages.value; i++) {
            range.push(i);
        }
    } else {
        // Show limited range with current page in middle when possible
        let start = Math.max(1, page.value - Math.floor(maxVisiblePages / 2));
        let end = Math.min(totalPages.value, start + maxVisiblePages - 1);

        // Adjust start if end is at maximum
        if (end === totalPages.value) {
            start = Math.max(1, end - maxVisiblePages + 1);
        }

        for (let i = start; i <= end; i++) {
            range.push(i);
        }
    }

    return range;
});

// Methods
const loadReviews = async () => {
    await fetchReviews(
        1, // Reset to first page
        props.perPage,
        undefined, // No restaurant_id filter
        props.productId,
        undefined, // No customer_id filter
        selectedRating.value || undefined, // Only filter if rating is not 0 (all)
        sortOrder.value
    );
    console.log("reviews: ",reviews.value);
};

const setRatingFilter = (rating) => {
    selectedRating.value = rating;
    loadReviews();
};

const changePage = (newPage) => {
    fetchReviews(
        newPage,
        props.perPage,
        undefined,
        props.productId,
        undefined,
        selectedRating.value || undefined,
        sortOrder.value
    );
};

const loadMore = () => {
    fetchReviews(
        page.value + 1,
        props.perPage,
        undefined,
        props.productId,
        undefined,
        selectedRating.value || undefined,
        sortOrder.value
    );
};

// Format date to Vietnamese format
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

// Watch for changes in productId
watch(() => props.productId, (newProductId) => {
    if (newProductId) {
        loadReviews();
    }
}, { immediate: false });

// Initialize
onMounted(() => {
    if (props.productId) {
        loadReviews();
    }
});
</script>
