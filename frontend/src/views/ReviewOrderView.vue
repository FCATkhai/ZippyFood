<template>
    <div class="container mx-auto px-4 py-8">
        <div v-if="loading" class="text-center">
            <div class="loading loading-spinner loading-lg"></div>
            <p class="mt-4">Đang tải thông tin...</p>
        </div>

        <div v-else-if="error" class="alert alert-error shadow-lg">
            <div>
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>{{ error }}</span>
            </div>
        </div>

        <div v-else>
            <!-- Order info header -->
            <div class="card bg-base-100 shadow-xl mb-6">
                <div class="card-body">
                    <h1 class="card-title text-2xl mb-4">Đánh giá đơn hàng</h1>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <p class="font-bold">Nhà hàng:</p>
                            <p>{{ order?.restaurant_id?.name || 'Không có thông tin' }}</p>
                        </div>
                        <div>
                            <p class="font-bold">Ngày đặt hàng:</p>
                            <p>{{ order?.order_date ? formatDate(order?.order_date) : "null" }}</p>
                        </div>
                        <div>
                            <p class="font-bold">Địa chỉ:</p>
                            <p>{{ order?.address || 'Không có thông tin' }}</p>
                        </div>
                        <div>
                            <p class="font-bold">Tổng tiền:</p>
                            <p>{{ order?.total_price ? formatCurrency(order?.total_price) : "null"  }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Review forms for each product -->
            <div v-if="order && order.products && order.products.length > 0">
                <form @submit.prevent="submitAllReviews">
                    <div v-for="(product, index) in order.products" :key="index"
                        class="card bg-base-100 shadow-xl mb-6">
                        <div class="card-body">
                            <h2 class="card-title">{{ product.name }}</h2>
                            <div class="divider"></div>

                            <!-- Product rating -->
                            <div class="form-control w-full mb-4">
                                <label class="label">
                                    <span class="label-text font-medium">Đánh giá món ăn</span>
                                    <span class="label-text-alt text-error"
                                        v-if="reviewForms[index].errors.product_rating">{{
                                        reviewForms[index].errors.product_rating }}</span>
                                </label>
                                <div class="rating rating-lg">
                                    <input type="radio" name="product-rating-{{index}}"
                                        class="mask mask-star-2 bg-orange-400" :value="1"
                                        v-model="reviewForms[index].product_rating" />
                                    <input type="radio" name="product-rating-{{index}}"
                                        class="mask mask-star-2 bg-orange-400" :value="2"
                                        v-model="reviewForms[index].product_rating" />
                                    <input type="radio" name="product-rating-{{index}}"
                                        class="mask mask-star-2 bg-orange-400" :value="3"
                                        v-model="reviewForms[index].product_rating" />
                                    <input type="radio" name="product-rating-{{index}}"
                                        class="mask mask-star-2 bg-orange-400" :value="4"
                                        v-model="reviewForms[index].product_rating" />
                                    <input type="radio" name="product-rating-{{index}}"
                                        class="mask mask-star-2 bg-orange-400" :value="5"
                                        v-model="reviewForms[index].product_rating" />
                                </div>
                            </div>

                            <!-- Restaurant service rating -->
                            <div class="form-control w-full mb-4">
                                <label class="label">
                                    <span class="label-text font-medium">Đánh giá dịch vụ nhà hàng</span>
                                    <span class="label-text-alt text-error"
                                        v-if="reviewForms[index].errors.restaurant_service_rating">{{
                                            reviewForms[index].errors.restaurant_service_rating }}</span>
                                </label>
                                <div class="rating rating-lg">
                                    <input type="radio" name="restaurant-rating-{{index}}"
                                        class="mask mask-star-2 bg-orange-400" :value="1"
                                        v-model="reviewForms[index].restaurant_service_rating" />
                                    <input type="radio" name="restaurant-rating-{{index}}"
                                        class="mask mask-star-2 bg-orange-400" :value="2"
                                        v-model="reviewForms[index].restaurant_service_rating" />
                                    <input type="radio" name="restaurant-rating-{{index}}"
                                        class="mask mask-star-2 bg-orange-400" :value="3"
                                        v-model="reviewForms[index].restaurant_service_rating" />
                                    <input type="radio" name="restaurant-rating-{{index}}"
                                        class="mask mask-star-2 bg-orange-400" :value="4"
                                        v-model="reviewForms[index].restaurant_service_rating" />
                                    <input type="radio" name="restaurant-rating-{{index}}"
                                        class="mask mask-star-2 bg-orange-400" :value="5"
                                        v-model="reviewForms[index].restaurant_service_rating" />
                                </div>
                            </div>

                            <!-- Review text -->
                            <div class="form-control w-full mb-4">
                                <label class="label">
                                    <span class="label-text font-medium">Nhận xét (không bắt buộc)</span>
                                </label>
                                <textarea class="block textarea textarea-bordered h-45"
                                    placeholder="Chia sẻ cảm nhận của bạn về món ăn này..."
                                    v-model="reviewForms[index].review_text"></textarea>
                            </div>

                            <!-- Image upload -->
                            <div class="form-control w-full mb-4">
                                <label class="label">
                                    <span class="label-text font-medium">Hình ảnh (không bắt buộc)</span>
                                </label>
                                <div class="flex items-center space-x-4">
                                    <label class="btn btn-outline">
                                        <i class="fa-solid fa-upload mr-2"></i> Tải ảnh lên
                                        <input type="file" accept="image/*" class="hidden"
                                            @change="handleImageUpload($event, index)" />
                                    </label>
                                    <span v-if="reviewForms[index].imageFile">
                                        {{ reviewForms[index].imageFile.name }}
                                        <button type="button" class="btn btn-circle btn-xs ml-2"
                                            @click="removeImage(index)">
                                            <i class="fa-solid fa-times"></i>
                                        </button>
                                    </span>
                                </div>
                                <div v-if="reviewForms[index].imagePreview" class="mt-4">
                                    <img :src="reviewForms[index].imagePreview" alt="Preview"
                                        class="w-32 h-32 object-cover rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Submit button -->
                    <div class="flex justify-end my-8">
                        <button type="submit" class="btn btn-primary" :disabled="submitting">
                            <i class="fa-solid fa-paper-plane mr-2"></i>
                            {{ submitting ? 'Đang gửi...' : 'Gửi đánh giá' }}
                        </button>
                    </div>
                </form>
            </div>

            <div v-else class="alert alert-info shadow-lg">
                <div>
                    <i class="fa-solid fa-info-circle"></i>
                    <span>Không có sản phẩm nào để đánh giá.</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOrder } from '@/composables/useOrder';
import { useReview } from '@/composables/useReview';
import { useToast } from 'vue-toastification';
import type { IOrder } from '~/shared/interface';


interface IReviewForm {
    product_rating: number;
    restaurant_service_rating: number;
    review_text: string;
    imageFile: File | null;
    imagePreview: string | null;
    errors: {
        product_rating: string;
        restaurant_service_rating: string;
    };
}

const route = useRoute();
const router = useRouter();
const toast = useToast();

const orderId = route.params.id as string;
const { order, fetchOrderById, loading: orderLoading, error: orderError } = useOrder();
const { create: createReview, loading: reviewLoading, error: reviewError } = useReview();

const loading = computed(() => orderLoading.value || reviewLoading.value);
const error = computed(() => orderError.value || reviewError.value);
const submitting = ref(false);
const reviewForms = ref<IReviewForm[]>([]);

onMounted(async () => {
    try {
        await fetchOrderById(orderId);
        if (order.value && order.value.products) {
            // Initialize review form for each product
            reviewForms.value = order.value.products.map(() => ({
                product_rating: 0,
                restaurant_service_rating: 0,
                review_text: '',
                imageFile: null,
                imagePreview: null,
                errors: reactive({
                    product_rating: '',
                    restaurant_service_rating: ''
                })
            }));
        }
    } catch (err) {
        toast.error('Không thể tải thông tin đơn hàng.');
    }
});

// Handle image upload
const handleImageUpload = (event: Event, index: number) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
        toast.error('Vui lòng chọn file hình ảnh.');
        return;
    }

    // Store the image file
    reviewForms.value[index].imageFile = file;

    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
        if (e.target && e.target.result === "string") {
            reviewForms.value[index].imagePreview = e.target.result;
        }
    };
    reader.readAsDataURL(file);
};

// Remove uploaded image
const removeImage = (index: number) => {
    reviewForms.value[index].imageFile = null;
    reviewForms.value[index].imagePreview = null;
};

// Format date
const formatDate = (dateString: Date) => {
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

// Format currency
const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

// Validate single review form
const validateReview = (form: IReviewForm, index: number) => {
    let isValid = true;

    // Reset errors
    form.errors.product_rating = '';
    form.errors.restaurant_service_rating = '';

    if (!form.product_rating || form.product_rating < 1 || form.product_rating > 5) {
        form.errors.product_rating = 'Vui lòng đánh giá món ăn';
        isValid = false;
    }

    if (!form.restaurant_service_rating || form.restaurant_service_rating < 1 || form.restaurant_service_rating > 5) {
        form.errors.restaurant_service_rating = 'Vui lòng đánh giá dịch vụ nhà hàng';
        isValid = false;
    }

    return isValid;
};

// Submit all reviews
const submitAllReviews = async () => {
    if (submitting.value) return;

    // Validate all forms
    let allValid = true;
    reviewForms.value.forEach((form, index) => {
        if (!validateReview(form, index)) {
            allValid = false;
        }
    });

    if (!allValid) {
        toast.error('Vui lòng đánh giá tất cả các mục bắt buộc.');
        return;
    }

    submitting.value = true;

    try {
        if (!order.value || !order.value.products) {
            toast.error('Không có sản phẩm nào để đánh giá.');
            return;
        }
        // Submit reviews one by one
        for (let i = 0; i < reviewForms.value.length; i++) {
            const form = reviewForms.value[i];
            const product = order.value.products[i];

            await createReview({
                product_id: typeof product.product_id === 'object' ? product.product_id._id : product.product_id,
                restaurant_id: typeof order.value.restaurant_id === 'object' ? order.value.restaurant_id._id : order.value.restaurant_id,
                order_id: orderId,
                restaurant_service_rating: form.restaurant_service_rating,
                product_rating: form.product_rating,
                review_text: form.review_text || undefined,
                image: form.imageFile || undefined
            });
        }

        toast.success('Đánh giá của bạn đã được gửi thành công!');
        router.push({name: 'order-history'});
    } catch (err) {
        toast.error('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
    } finally {
        submitting.value = false;
    }
};
</script>
