<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>

        <!-- Status Filter Tabs -->
        <div class="tabs tabs-boxed mb-6">
            <a v-for="tab in statusTabs" :key="tab.value" class="tab tab-lg"
                :class="{ 'tab-active': selectedStatus === tab.value }" @click="changeStatusTab(tab.value)">
                <i :class="tab.icon + ' mr-2'"></i>
                {{ tab.label }}
                <span v-if="tab.value === ''" class="badge badge-sm ml-2">{{ total }}</span>
            </a>
        </div>

        <!-- Orders List -->
        <div v-if="loading" class="flex justify-center items-center py-12">
            <span class="loading loading-spinner loading-lg"></span>
        </div>

        <div v-else-if="orders.length === 0" class="py-12 text-center">
            <i class="fas fa-shopping-bag text-4xl text-gray-400 mb-4"></i>
            <p class="text-lg">Bạn chưa có đơn hàng nào
                <span v-if="selectedStatus !== ''">{{ getStatusLabel(selectedStatus).toLowerCase() }}</span>
            </p>
            <button class="btn btn-primary mt-4" @click="goToShopping">
                <i class="fas fa-utensils mr-2"></i> Đặt món ngay
            </button>
        </div>

        <div v-else>
            <div v-for="order in orders" :key="order._id" class="card bg-base-100 shadow-xl mb-6">
                <div class="card-body">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                        <div>
                            <h2 class="card-title flex items-center">
                                <i class="fas fa-shopping-bag mr-2"></i>
                                Đơn hàng #{{ formatOrderId(order._id) }}
                                <div :class="getStatusBadgeClass(order.status)" class="ml-2">
                                    {{ translateStatus(order.status) }}
                                </div>
                            </h2>
                            <p class="text-sm text-gray-500">{{ formatDate(order.order_date) }}</p>
                        </div>
                        <div class="mt-2 md:mt-0">
                            <button v-if="order.status === 'pending'" class="btn btn-sm btn-error"
                                @click="confirmCancelOrder(order._id)">
                                <i class="fas fa-times-circle mr-2"></i> Hủy đơn
                            </button>
                            <button class="btn btn-sm btn-primary ml-2" @click="showOrderDetail(order)">
                                <i class="fas fa-eye mr-2"></i> Chi tiết
                            </button>
                        </div>
                    </div>

                    <div class="divider my-2"></div>

                    <div class="flex flex-col md:flex-row justify-between">
                        <div class="mb-4 md:mb-0">
                            <h3 class="font-semibold mb-2">
                                <i class="fas fa-store mr-2"></i> Nhà hàng
                            </h3>
                            <p>{{ getRestaurantName(order) }}</p>
                        </div>

                        <div class="mb-4 md:mb-0">
                            <h3 class="font-semibold mb-2">
                                <i class="fas fa-map-marker-alt mr-2"></i> Địa chỉ giao hàng
                            </h3>
                            <p>{{ order.address }}</p>
                        </div>

                        <div>
                            <h3 class="font-semibold mb-2">
                                <i class="fas fa-money-bill-wave mr-2"></i> Tổng tiền
                            </h3>
                            <p class="text-lg font-semibold text-primary">{{ formatCurrency(order.total_price) }} đ</p>
                        </div>
                    </div>

                    <div class="mt-4 flex flex-wrap gap-2">
                        <div v-for="(product, index) in getPreviewProducts(order)" :key="index"
                            class="badge badge-outline">
                            {{ product.name }} x{{ product.quantity }}
                        </div>
                        <div v-if="order.products.length > 3" class="badge badge-outline">
                            +{{ order.products.length - 3 }} món khác
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div class="flex justify-between items-center mt-8">
                <div>
                    <span>Hiển thị {{ orders.length }} / {{ total }} đơn hàng</span>
                </div>
                <div class="join">
                    <button class="join-item btn" :class="{ 'btn-disabled': page <= 1 }" @click="changePage(page - 1)">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="join-item btn">{{ page }}</button>
                    <button class="join-item btn" :class="{ 'btn-disabled': !hasMore }" @click="changePage(page + 1)">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Order Detail Modal -->
        <div class="modal" :class="{ 'modal-open': selectedOrder !== null }">
            <div class="modal-box max-w-3xl">
                <h3 class="font-bold text-lg mb-4" v-if="selectedOrder">
                    Chi tiết đơn hàng #{{ formatOrderId(selectedOrder._id) }}
                    <div :class="getStatusBadgeClass(selectedOrder.status)" class="badge ml-2">
                        {{ translateStatus(selectedOrder.status) }}
                    </div>
                </h3>
                <button class="btn btn-sm btn-circle absolute right-2 top-2" @click="closeOrderDetail">
                    <i class="fas fa-times"></i>
                </button>

                <div v-if="selectedOrder" class="mt-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <h4 class="font-semibold mb-2">
                                <i class="fas fa-store mr-2"></i> Nhà hàng
                            </h4>
                            <p>{{ getRestaurantName(selectedOrder) }}</p>

                            <h4 class="font-semibold mt-4 mb-2">
                                <i class="fas fa-map-marker-alt mr-2"></i> Địa chỉ giao hàng
                            </h4>
                            <p>{{ selectedOrder.address }}</p>
                        </div>
                        <div>
                            <h4 class="font-semibold mb-2">
                                <i class="fas fa-calendar-alt mr-2"></i> Ngày đặt hàng
                            </h4>
                            <p>{{ formatDate(selectedOrder.order_date) }}</p>

                            <h4 class="font-semibold mt-4 mb-2">
                                <i class="fas fa-sticky-note mr-2"></i> Ghi chú
                            </h4>
                            <p>{{ selectedOrder.note || 'Không có ghi chú' }}</p>
                        </div>
                    </div>

                    <div class="divider"></div>

                    <h4 class="font-semibold mb-2">Danh sách món ăn</h4>
                    <div class="overflow-x-auto">
                        <table class="table w-full">
                            <thead>
                                <tr>
                                    <th>Tên món</th>
                                    <th class="text-right">Đơn giá</th>
                                    <th class="text-right">Số lượng</th>
                                    <th class="text-right">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in selectedOrder.products" :key="index">
                                    <td>{{ item.name }}</td>
                                    <td class="text-right">{{ formatCurrency(item.price) }} đ</td>
                                    <td class="text-right">{{ item.quantity }}</td>
                                    <td class="text-right">{{ formatCurrency(item.subtotal) }} đ</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3" class="text-right font-semibold">Tổng cộng:</td>
                                    <td class="text-right font-semibold">{{ formatCurrency(selectedOrder.total_price) }}
                                        đ</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div class="divider"></div>

                    <div class="flex justify-between items-center">
                        <div>
                            <h4 class="font-semibold">Trạng thái đơn hàng</h4>
                            <div class="flex items-center mt-2">
                                <div class="flex items-center">
                                    <div class="badge badge-lg"
                                        :class="getStatusStepClass(selectedOrder.status, 'pending')">1</div>
                                    <span class="mx-1">Chờ xác nhận</span>
                                </div>
                                <div class="w-4 h-0.5 bg-gray-300 mx-1"></div>
                                <div class="flex items-center">
                                    <div class="badge badge-lg"
                                        :class="getStatusStepClass(selectedOrder.status, 'processing')">2</div>
                                    <span class="mx-1">Đang xử lý</span>
                                </div>
                                <div class="w-4 h-0.5 bg-gray-300 mx-1"></div>
                                <div class="flex items-center">
                                    <div class="badge badge-lg"
                                        :class="getStatusStepClass(selectedOrder.status, 'ordering')">3</div>
                                    <span class="mx-1">Đang giao</span>
                                </div>
                                <div class="w-4 h-0.5 bg-gray-300 mx-1"></div>
                                <div class="flex items-center">
                                    <div class="badge badge-lg"
                                        :class="getStatusStepClass(selectedOrder.status, 'completed')">4</div>
                                    <span class="mx-1">Hoàn thành</span>
                                </div>
                            </div>
                        </div>
                        <button v-if="selectedOrder.status === 'pending'" class="btn btn-error"
                            @click="confirmCancelOrder(selectedOrder._id)">
                            <i class="fas fa-times-circle mr-2"></i> Hủy đơn
                        </button>
                        <button v-if="selectedOrder.status === 'completed'" class="btn btn-accent"
                            @click="goToReviewOrder(selectedOrder._id)">
                            <i class="fas fa-star mr-2"></i> Đánh giá
                        </button>
                    </div>
                </div>

                <div class="modal-action">
                    <button class="btn" @click="closeOrderDetail">Đóng</button>
                </div>
            </div>
        </div>

        <!-- Cancel Confirmation Modal -->
        <div class="modal" :class="{ 'modal-open': showCancelModal }">
            <div class="modal-box">
                <h3 class="font-bold text-lg">Xác nhận hủy đơn</h3>
                <p class="py-4">Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
                <p class="text-sm text-gray-500">Lưu ý: Đơn hàng đã hủy không thể khôi phục lại.</p>
                <div class="modal-action">
                    <button class="btn btn-error" @click="processCancelOrder">
                        <i class="fas fa-check mr-2"></i> Xác nhận hủy
                    </button>
                    <button class="btn" @click="cancelCancelAction">Giữ đơn hàng</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useOrder } from '@/composables/useOrder';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const customerId = computed(() => authStore.user?._id);

// Props
//   const props = defineProps({
//     customerId: {
//       type: String,
//       required: true
//     }
//   });

// Router
const router = useRouter();

// Setup composables
const {
    orders: ordersList,
    total,
    page: currentPage,
    limit,
    hasMore,
    loading,
    error,
    fetchOrdersByUser,
    updateStatus
} = useOrder();

const toast = useToast();

// Local state
const orders = computed(() => ordersList.value);
const page = computed(() => currentPage.value);
const selectedStatus = ref('');
const selectedOrder = ref(null);
const showCancelModal = ref(false);
const cancelOrderId = ref(null);

// Status tabs
const statusTabs = [
    { label: 'Tất cả', value: '', icon: 'fas fa-list' },
    { label: 'Chờ xác nhận', value: 'pending', icon: 'fas fa-clock' },
    { label: 'Đang xử lý', value: 'processing', icon: 'fas fa-spinner' },
    { label: 'Đang giao', value: 'ordering', icon: 'fas fa-truck' },
    { label: 'Hoàn thành', value: 'completed', icon: 'fas fa-check-circle' },
    { label: 'Đã hủy', value: 'cancelled', icon: 'fas fa-times-circle' }
];

// Lifecycle hooks
onMounted(() => {
    loadOrders();
});

// Watch for changes in selectedStatus
watch(selectedStatus, () => {
    loadOrders();
});

// Methods
async function loadOrders() {
    try {
        await fetchOrdersByUser(
            customerId.value,
            currentPage.value,
            limit.value,
            selectedStatus.value || undefined
        );
        if (error.value) {
            toast.error(error.value);
        }
    } catch (err) {
        toast.error('Không thể tải danh sách đơn hàng');
    }
}

function changeStatusTab(status) {
    selectedStatus.value = status;
}

function changePage(newPage) {
    if (newPage < 1 || (newPage > currentPage.value && !hasMore.value)) return;

    fetchOrdersByUser(
        customerId.value,
        newPage,
        limit.value,
        selectedStatus.value || undefined
    );
}

function showOrderDetail(order) {
    selectedOrder.value = { ...order };
}

function closeOrderDetail() {
    selectedOrder.value = null;
}

function confirmCancelOrder(orderId) {
    cancelOrderId.value = orderId;
    showCancelModal.value = true;
    closeOrderDetail();
}

function cancelCancelAction() {
    showCancelModal.value = false;
    cancelOrderId.value = null;
}

async function processCancelOrder() {
    try {
        await updateStatus(cancelOrderId.value, 'cancelled');
        toast.success('Đã hủy đơn hàng thành công');
        showCancelModal.value = false;
        cancelOrderId.value = null;
        loadOrders();
    } catch (err) {
        toast.error('Không thể hủy đơn hàng');
    }
}

function goToReviewOrder(orderId) {
    router.push({ name: 'review-order', params: { id: orderId } });
}

function goToShopping() {
    router.push('/restaurants');
}

// Helper functions
function formatOrderId(id) {
    if (!id) return '';
    const idStr = id.toString();
    // return idStr.substring(idStr.length - 6).toUpperCase();
    return idStr;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN').format(value);
}

function getRestaurantName(order) {
    // Assuming restaurant_id might be populated with restaurant object
    if (typeof order.restaurant_id === 'object' && order.restaurant_id !== null) {
        return order.restaurant_id.name || 'Nhà hàng';
    }
    return 'Nhà hàng';
}

function translateStatus(status) {
    const statusMap = {
        'pending': 'Chờ xác nhận',
        'processing': 'Đang xử lý',
        'ordering': 'Đang giao hàng',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

function getStatusLabel(status) {
    return translateStatus(status);
}

function getStatusBadgeClass(status) {
    const classMap = {
        'pending': 'badge badge-warning',
        'processing': 'badge badge-info',
        'ordering': 'badge badge-primary',
        'completed': 'badge badge-success',
        'cancelled': 'badge badge-error'
    };
    return classMap[status] || 'badge';
}

function getStatusStepClass(currentStatus, stepStatus) {
    const statusOrder = ['pending', 'processing', 'ordering', 'completed'];

    if (currentStatus === 'cancelled') {
        return stepStatus === 'pending' ? 'badge-error' : 'badge-ghost';
    }

    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (stepIndex < currentIndex) {
        return 'badge-success'; // Completed steps
    } else if (stepIndex === currentIndex) {
        return 'badge-info'; // Current step
    } else {
        return 'badge-ghost'; // Future steps
    }
}

function getPreviewProducts(order) {
    // Return only first 3 products for preview
    return order.products.slice(0, 3);
}
</script>
