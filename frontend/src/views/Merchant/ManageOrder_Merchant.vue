<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>

        <!-- Search and Filter -->
        <div class="bg-base-200 p-4 rounded-lg mb-6">
            <div class="flex flex-col md:flex-row gap-4">
                <!-- <div class="form-control flex-1">
                    <div class="input-group">
                        <input v-model="searchQuery" type="text" placeholder="Tìm kiếm đơn hàng..."
                            class="input input-bordered w-full" @keyup.enter="handleSearch" />
                        <button class="btn btn-square" @click="handleSearch">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div> -->

                <div class="form-control">
                    <select v-model="selectedStatus" class="select select-bordered" @change="applyFilters">
                        <option value="">Tất cả trạng thái</option>
                        <option value="pending">Chờ xác nhận</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="ordering">Đang giao hàng</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>

                <div class="form-control">
                    <button class="btn btn-primary" @click="refreshOrders">
                        <i class="fas fa-sync-alt mr-2"></i> Làm mới
                    </button>
                </div>
            </div>
        </div>

        <!-- Orders Table -->
        <div class="bg-base-100 rounded-lg shadow-lg overflow-x-auto">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Tổng tiền</th>
                        <th>Địa chỉ</th>
                        <th>Ngày đặt</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody v-if="!loading">
                    <tr v-for="order in orders" :key="order._id" class="hover:bg-base-200">
                        <td class="font-medium">{{ formatOrderId(order._id) }}</td>
                        <td>{{ getCustomerName(order) }}</td>
                        <td>{{ formatCurrency(order.total_price) }} đ</td>
                        <td class="max-w-xs truncate">{{ order.address }}</td>
                        <td>{{ formatDate(order.order_date) }}</td>
                        <td>
                            <div :class="getStatusBadgeClass(order.status)">
                                {{ translateStatus(order.status) }}
                            </div>
                        </td>
                        <td>
                            <div class="flex gap-2">
                                <button class="btn btn-sm btn-info" @click="showOrderDetail(order)">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <div class="dropdown dropdown-end">
                                    <button tabindex="0" class="btn btn-sm btn-outline">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </button>
                                    <ul tabindex="0"
                                        class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                        <li v-if="canUpdateStatus(order.status, 'processing')">
                                            <a @click="changeOrderStatus(order._id, 'processing')">
                                                <i class="fas fa-check text-success"></i> Xác nhận đơn
                                            </a>
                                        </li>
                                        <li v-if="canUpdateStatus(order.status, 'ordering')">
                                            <a @click="changeOrderStatus(order._id, 'ordering')">
                                                <i class="fas fa-truck text-info"></i> Bắt đầu giao hàng
                                            </a>
                                        </li>
                                        <li v-if="canUpdateStatus(order.status, 'completed')">
                                            <a @click="changeOrderStatus(order._id, 'completed')">
                                                <i class="fas fa-check-circle text-success"></i> Hoàn thành
                                            </a>
                                        </li>
                                        <li v-if="canUpdateStatus(order.status, 'cancelled')">
                                            <a @click="confirmCancelOrder(order._id)">
                                                <i class="fas fa-times-circle text-error"></i> Hủy đơn
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="orders.length === 0">
                        <td colspan="7" class="text-center py-8">Không có đơn hàng nào</td>
                    </tr>
                </tbody>
                <tbody v-else>
                    <tr>
                        <td colspan="7" class="text-center py-8">
                            <span class="loading loading-spinner loading-lg"></span>
                            <p class="mt-2">Đang tải dữ liệu...</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-6">
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

        <!-- Order Detail Modal -->
        <div v-if="selectedOrder" class="modal modal-open">
            <div class="modal-box max-w-3xl">
                <h3 class="font-bold text-lg mb-4">
                    Chi tiết đơn hàng #{{ formatOrderId(selectedOrder._id) }}
                </h3>
                <button class="btn btn-sm btn-circle absolute right-2 top-2" @click="closeOrderDetail">
                    <i class="fas fa-times"></i>
                </button>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <h4 class="font-semibold mb-2">Thông tin khách hàng</h4>
                        <p><i class="fas fa-user mr-2"></i> {{ getCustomerName(selectedOrder) }}</p>
                        <p><i class="fas fa-map-marker-alt mr-2"></i> {{ selectedOrder.address }}</p>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-2">Thông tin đơn hàng</h4>
                        <p><i class="fas fa-calendar-alt mr-2"></i> {{ formatDate(selectedOrder.order_date) }}</p>
                        <p>
                            <i class="fas fa-tag mr-2"></i>
                            <span :class="getStatusBadgeClass(selectedOrder.status)">
                                {{ translateStatus(selectedOrder.status) }}
                            </span>
                        </p>
                        <p v-if="selectedOrder.note">
                            <i class="fas fa-sticky-note mr-2"></i> {{ selectedOrder.note }}
                        </p>
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
                                <td class="text-right font-semibold">{{ formatCurrency(selectedOrder.total_price) }} đ
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="divider"></div>

                <div class="modal-action">
                    <div class="flex flex-wrap gap-2">
                        <button v-if="canUpdateStatus(selectedOrder.status, 'processing')" class="btn btn-success"
                            @click="changeOrderStatus(selectedOrder._id, 'processing')">
                            <i class="fas fa-check mr-2"></i> Xác nhận đơn
                        </button>
                        <button v-if="canUpdateStatus(selectedOrder.status, 'ordering')" class="btn btn-info"
                            @click="changeOrderStatus(selectedOrder._id, 'ordering')">
                            <i class="fas fa-truck mr-2"></i> Bắt đầu giao hàng
                        </button>
                        <button v-if="canUpdateStatus(selectedOrder.status, 'completed')" class="btn btn-success"
                            @click="changeOrderStatus(selectedOrder._id, 'completed')">
                            <i class="fas fa-check-circle mr-2"></i> Hoàn thành
                        </button>
                        <button v-if="canUpdateStatus(selectedOrder.status, 'cancelled')" class="btn btn-error"
                            @click="confirmCancelOrder(selectedOrder._id)">
                            <i class="fas fa-times-circle mr-2"></i> Hủy đơn
                        </button>
                        <button class="btn" @click="closeOrderDetail">Đóng</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Cancel Confirmation Modal -->
        <div v-if="showCancelModal" class="modal modal-open">
            <div class="modal-box">
                <h3 class="font-bold text-lg">Xác nhận hủy đơn</h3>
                <p class="py-4">Bạn có chắc chắn muốn hủy đơn hàng này?</p>
                <div class="modal-action">
                    <button class="btn btn-error" @click="processCancelOrder">
                        <i class="fas fa-check mr-2"></i> Hủy đơn
                    </button>
                    <button class="btn" @click="showCancelModal = false">Đóng</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOrder } from '@/composables/useOrder';
import { useToast } from 'vue-toastification';
import { useRestaurantStore } from '@/stores/restaurantStore';

const restaurantStore = useRestaurantStore();
const restaurantId = computed(() => restaurantStore.restaurant._id);
// Props
// const props = defineProps({
//     restaurantId: {
//         type: String,
//         required: true
//     }
// });

// Setup composables
const {
    orders: ordersList,
    total,
    page: currentPage,
    limit,
    hasMore,
    loading,
    error,
    fetchOrdersByRestaurant,
    updateStatus
} = useOrder();

const toast = useToast();

// Local state
const orders = computed(() => ordersList.value);
const page = computed(() => currentPage.value);
const searchQuery = ref('');
const selectedStatus = ref('');
const selectedOrder = ref(null);
const showCancelModal = ref(false);
const cancelOrderId = ref(null);

// Lifecycle hooks
onMounted(() => {
    loadOrders();
});

// Methods
async function loadOrders() {
    try {
        await fetchOrdersByRestaurant(
            restaurantId.value,
            currentPage.value,
            limit.value,
            selectedStatus.value || undefined,
            searchQuery.value || undefined
        );
        if (error.value) {
            toast.error(error.value);
        }
    } catch (err) {
        toast.error('Không thể tải danh sách đơn hàng');
    }
}

function handleSearch() {
    loadOrders();
}

function applyFilters() {
    loadOrders();
}

function refreshOrders() {
    searchQuery.value = '';
    selectedStatus.value = '';
    loadOrders();
}

function changePage(newPage) {
    if (newPage < 1 || (newPage > currentPage.value && !hasMore.value)) return;

    fetchOrdersByRestaurant(
        restaurantId.value,
        newPage,
        limit.value,
        selectedStatus.value || undefined,
        searchQuery.value || undefined
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

async function processCancelOrder() {
    try {
        await updateStatus(cancelOrderId.value, 'cancelled');
        toast.success('Đã hủy đơn hàng thành công');
    } catch (err) {
        toast.error('Không thể hủy đơn hàng');
    } finally {
        showCancelModal.value = false;
        cancelOrderId.value = null;
        loadOrders();
    }
}

async function changeOrderStatus(orderId, newStatus) {
    try {
        await updateStatus(orderId, newStatus);
        toast.success(`Đã cập nhật trạng thái đơn hàng thành công`);
        closeOrderDetail();
        loadOrders();
    } catch (err) {
        toast.error('Không thể cập nhật trạng thái đơn hàng');
    }
}

// Helper functions
function formatOrderId(id) {
    if (!id) return '';
    const idStr = id.toString();
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

function getCustomerName(order) {
    // Assuming customer_id might be populated with user object
    if (typeof order.customer_id === 'object' && order.customer_id !== null) {
        return order.customer_id.name || 'Khách hàng';
    }
    return 'Khách hàng';
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

function canUpdateStatus(currentStatus, newStatus) {
    const statusFlow = {
        'pending': ['processing', 'cancelled'],
        'processing': ['ordering', 'cancelled'],
        'ordering': ['completed', 'cancelled'],
        'completed': [],
        'cancelled': []
    };

    return statusFlow[currentStatus]?.includes(newStatus) || false;
}
</script>
