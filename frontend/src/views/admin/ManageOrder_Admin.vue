<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-6">Quản lý đơn hàng hệ thống</h1>

        <!-- Search and Filter -->
        <div class="bg-base-200 p-4 rounded-lg mb-6">
            <div class="flex flex-col md:flex-row gap-4">
                <div class="form-control">
                    <button @click="refreshOrders" class="btn btn-outline" :disabled="loading">
                        <i class="fa-solid fa-rotate"></i> Làm mới
                    </button>
                </div>
                <div class="form-control flex-1">
                    <div class="input-group">
                        <input v-model="searchQuery" type="text"
                            placeholder="Tìm kiếm theo mã đơn hàng, tên nhà hàng, số điện thoại KH..."
                            class="input input-bordered w-full" @keyup.enter="handleSearch" />
                        <button class="btn btn-square" @click="handleSearch">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>

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


            </div>
        </div>

        <!-- Orders Table -->
        <div class="bg-base-100 rounded-lg shadow-lg overflow-x-auto">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Nhà hàng</th>
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
                        <td>{{ getRestaurantName(order) }}</td>
                        <td>{{ formatCurrency(order.total_price) }} đ</td>
                        <td class="max-w-xs truncate">{{ order.address }}</td>
                        <td>{{ formatDate(order.order_date) }}</td>
                        <td>
                            <div :class="getStatusBadgeClass(order.status)">
                                {{ translateStatus(order.status) }}
                            </div>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-info" @click="showOrderDetail(order)">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                    <tr v-if="orders.length === 0">
                        <td colspan="8" class="text-center py-8">Không có đơn hàng nào</td>
                    </tr>
                </tbody>
                <tbody v-else>
                    <tr>
                        <td colspan="8" class="text-center py-8">
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
                        <h4 class="font-semibold mb-2">Thông tin nhà hàng</h4>
                        <p><i class="fas fa-store mr-2"></i> {{ getRestaurantName(selectedOrder) }}</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <h4 class="font-semibold mb-2">Thông tin đơn hàng</h4>
                        <p><i class="fas fa-calendar-alt mr-2"></i> {{ formatDate(selectedOrder.order_date) }}</p>
                        <p>
                            <i class="fas fa-tag mr-2"></i>
                            <span :class="getStatusBadgeClass(selectedOrder.status)">
                                {{ translateStatus(selectedOrder.status) }}
                            </span>
                        </p>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-2">Ghi chú</h4>
                        <p><i class="fas fa-sticky-note mr-2"></i> {{ selectedOrder.note || 'Không có ghi chú' }}</p>
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

                <div class="flex items-center mb-4">
                    <h4 class="font-semibold">Trạng thái đơn hàng</h4>
                    <div class="ml-4">
                        <div class="flex items-center">
                            <div class="badge badge-lg" :class="getStatusStepClass(selectedOrder.status, 'pending')">1
                            </div>
                            <span class="mx-1">Chờ xác nhận</span>
                            <div class="w-4 h-0.5 bg-gray-300 mx-1"></div>
                            <div class="badge badge-lg" :class="getStatusStepClass(selectedOrder.status, 'processing')">
                                2</div>
                            <span class="mx-1">Đang xử lý</span>
                            <div class="w-4 h-0.5 bg-gray-300 mx-1"></div>
                            <div class="badge badge-lg" :class="getStatusStepClass(selectedOrder.status, 'ordering')">3
                            </div>
                            <span class="mx-1">Đang giao</span>
                            <div class="w-4 h-0.5 bg-gray-300 mx-1"></div>
                            <div class="badge badge-lg" :class="getStatusStepClass(selectedOrder.status, 'completed')">4
                            </div>
                            <span class="mx-1">Hoàn thành</span>
                        </div>
                    </div>
                </div>



                <div class="modal-action">
                    <button class="btn" @click="closeOrderDetail">Đóng</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOrder } from '@/composables/useOrder';
import { useToast } from 'vue-toastification';

// Setup composables
const {
    orders: ordersList,
    total,
    page: currentPage,
    limit,
    hasMore,
    loading,
    error,
    fetchOrders
} = useOrder();

const toast = useToast();

// Local state
const orders = computed(() => ordersList.value);
const page = computed(() => currentPage.value);
const searchQuery = ref('');
const selectedStatus = ref('');
const restaurantFilter = ref('');
const selectedOrder = ref(null);


// Lifecycle hooks
onMounted(() => {
    loadOrders();

});

// Methods
async function loadOrders() {
    try {
        await fetchOrders(
            currentPage.value,
            limit.value,
            selectedStatus.value || undefined,
            searchQuery.value || undefined,
            restaurantFilter.value || undefined
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
    restaurantFilter.value = '';
    loadOrders();
}

function changePage(newPage) {
    if (newPage < 1 || (newPage > currentPage.value && !hasMore.value)) return;

    fetchOrders(
        newPage,
        limit.value,
        selectedStatus.value || undefined,
        searchQuery.value || undefined,
        restaurantFilter.value || undefined
    );
}

function showOrderDetail(order) {
    selectedOrder.value = { ...order };
}

function closeOrderDetail() {
    selectedOrder.value = null;
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
</script>
