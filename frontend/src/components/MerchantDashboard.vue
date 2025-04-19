<template>
    <div class="p-4">
        <div v-if="loading" class="flex justify-center items-center h-64">
            <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>

        <div v-else-if="error" class="alert alert-error">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>{{ error }}</span>
        </div>

        <div v-else>
            <!-- Current stats summary -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="stats shadow">
                    <div class="stat">
                        <div class="stat-figure text-primary">
                            <i class="fa-solid fa-clock-rotate-left text-3xl"></i>
                        </div>
                        <div class="stat-title">Đơn hàng đang chờ</div>
                        <div class="stat-value text-primary">{{ currentStats.pending_orders }}</div>
                        <div class="stat-desc">Cần được xử lý</div>
                    </div>

                    <div class="stat">
                        <div class="stat-figure text-secondary">
                            <i class="fa-solid fa-utensils text-3xl"></i>
                        </div>
                        <div class="stat-title">Tổng sản phẩm</div>
                        <div class="stat-value text-secondary">{{ currentStats.total_products }}</div>
                        <div class="stat-desc">Trong thực đơn của bạn</div>
                    </div>
                </div>
            </div>

            <!-- Daily and Monthly Stats -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Daily Stats -->
                <div class="card bg-base-100 shadow-xl">
                    <div class="card-body">
                        <h2 class="card-title text-xl mb-4">
                            <i class="fa-solid fa-calendar-day mr-2"></i>Thống kê hôm nay
                        </h2>

                        <div class="stats stats-vertical bg-base-200 w-full">
                            <div class="stat">
                                <div class="stat-title">Đơn hoàn thành</div>
                                <div class="stat-value text-primary">{{ stats.daily?.completed_orders || 0 }}</div>
                            </div>

                            <div class="stat">
                                <div class="stat-title">Doanh thu</div>
                                <div class="stat-value text-secondary">{{ formatCurrency(stats.daily?.revenue || 0) }} đ
                                </div>
                            </div>
                        </div>

                        <div class="mt-4">
                            <h3 class="font-bold text-lg mb-2">Sản phẩm bán chạy</h3>
                            <div v-if="stats.daily?.top_products?.length">
                                <div class="overflow-x-auto">
                                    <table class="table w-full">
                                        <thead>
                                            <tr>
                                                <th>Sản phẩm</th>
                                                <th class="text-right">Số lượng</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="product in stats.daily.top_products" :key="product.product_id">
                                                <td>{{ product.name }}</td>
                                                <td class="text-right">{{ product.totalSold }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div v-else class="text-center py-4">
                                <p class="text-gray-500">Chưa có sản phẩm nào được bán hôm nay</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Monthly Stats -->
                <div class="card bg-base-100 shadow-xl">
                    <div class="card-body">
                        <h2 class="card-title text-xl mb-4">
                            <i class="fa-solid fa-calendar-month mr-2"></i>Thống kê tháng này
                        </h2>

                        <div class="stats stats-vertical bg-base-200 w-full">
                            <div class="stat">
                                <div class="stat-title">Đơn hoàn thành</div>
                                <div class="stat-value text-primary">{{ stats.monthly?.completed_orders || 0 }}</div>
                            </div>

                            <div class="stat">
                                <div class="stat-title">Doanh thu</div>
                                <div class="stat-value text-secondary">{{ formatCurrency(stats.monthly?.revenue || 0) }}
                                    đ</div>
                            </div>
                        </div>

                        <div class="mt-4">
                            <h3 class="font-bold text-lg mb-2">Sản phẩm bán chạy</h3>
                            <div v-if="stats.monthly?.top_products?.length">
                                <canvas ref="monthlyChart" height="200"></canvas>
                            </div>
                            <div v-else class="text-center py-4">
                                <p class="text-gray-500">Chưa có sản phẩm nào được bán trong tháng này</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Reports -->
            <div class="card bg-base-100 shadow-xl mb-6">
                <div class="card-body">
                    <h2 class="card-title">
                        <i class="fa-solid fa-history mr-2"></i>Lịch sử báo cáo
                    </h2>

                    <div class="flex flex-wrap gap-4 mb-4">
                        <div class="form-control">
                            <div class="input-group">
                                <span class="label-text">Từ ngày</span>
                                <input type="date" v-model="filterParams.start_date"
                                    class="input input-bordered input-sm" />
                            </div>
                        </div>

                        <div class="form-control">
                            <div class="input-group">
                                <span class="label-text">Đến ngày</span>
                                <input type="date" v-model="filterParams.end_date"
                                    class="input input-bordered input-sm" />
                            </div>
                        </div>

                        <div class="form-control">
                            <div class="input-group">
                                <span class="label-text">Loại</span>
                                <select v-model="filterParams.period" class="select select-bordered select-sm">
                                    <option value="">Tất cả</option>
                                    <option value="daily">Ngày</option>
                                    <option value="monthly">Tháng</option>
                                </select>
                            </div>
                        </div>

                        <button class="btn btn-primary btn-sm" @click="applyFilters">
                            <i class="fa-solid fa-filter mr-1"></i>Lọc
                        </button>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="table table-zebra w-full">
                            <thead>
                                <tr>
                                    <th>Ngày</th>
                                    <th>Loại</th>
                                    <th>Đơn hoàn thành</th>
                                    <th>Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="report in history.data" :key="report._id">
                                    <td>{{ formatDate(report.report_date) }}</td>
                                    <td>{{ report.period === 'daily' ? 'Ngày' : 'Tháng' }}</td>
                                    <td>{{ report.completed_orders }}</td>
                                    <td>{{ formatCurrency(report.revenue) }} đ</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div v-if="history.data.length === 0" class="text-center py-4">
                        <p class="text-gray-500">Không có dữ liệu</p>
                    </div>

                    <!-- Pagination -->
                    <div v-if="history.total_pages > 1" class="flex justify-center mt-4">
                        <div class="join">
                            <button class="join-item btn" :class="{ 'btn-disabled': history.page === 1 }"
                                @click="changePage(history.page - 1)">
                                <i class="fa-solid fa-chevron-left"></i>
                            </button>

                            <button class="join-item btn btn-active">{{ history.page }}</button>

                            <button class="join-item btn"
                                :class="{ 'btn-disabled': history.page === history.total_pages }"
                                @click="changePage(history.page + 1)">
                                <i class="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue';
import { useMerchantReports } from '@/composables/merchant/useMerchantReport';
import Chart from 'chart.js/auto';
import { useToast } from 'vue-toastification';

// Props
const props = defineProps({
    restaurant_id: {
        type: String,
        required: true
    }
});

// Setup toast
const toast = useToast();

// Setup chart reference
const monthlyChart = ref(null);
let chartInstance = null;

// Setup merchant reports composable
const {
    stats,
    currentStats,
    history,
    loading,
    error,
    fetchStats,
    fetchCurrentStats,
    fetchReportHistory
} = useMerchantReports();

// Setup filter params
const filterParams = reactive({
    start_date: '',
    end_date: '',
    period: '',
    page: 1,
    limit: 10
});

// Methods
const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
};

const applyFilters = () => {
    filterParams.page = 1;
    fetchReportData();
};

const changePage = (page) => {
    filterParams.page = page;
    fetchReportData();
};

const fetchReportData = async () => {
    try {
        // Fetch all stats
        await Promise.all([
            fetchStats(props.restaurant_id),
            fetchCurrentStats(props.restaurant_id),
            fetchReportHistory(props.restaurant_id, {
                start_date: filterParams.start_date || undefined,
                end_date: filterParams.end_date || undefined,
                period: filterParams.period || undefined,
                page: filterParams.page,
                limit: filterParams.limit
            })
        ]);

        // Create chart after data is loaded
        nextTick(() => {
            renderMonthlyChart();
        });
    } catch (err) {
        toast.error('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
        console.error('Error loading stats:', err);
    }
};

const renderMonthlyChart = () => {
    if (!stats.monthly?.top_products?.length || !monthlyChart.value) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    const ctx = monthlyChart.value.getContext('2d');
    const labels = stats.monthly.top_products.map(product => product.name);
    const data = stats.monthly.top_products.map(product => product.totalSold);

    // Random colors for the chart
    const backgroundColors = stats.monthly.top_products.map(() =>
        `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
    );

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số lượng bán ra',
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Sản phẩm bán chạy trong tháng',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
};

// Watch for restaurant_id changes
watch(() => props.restaurant_id, (newVal) => {
    if (newVal) {
        fetchReportData();
    }
}, { immediate: false });

// Initial data fetch
onMounted(() => {
    if (props.restaurant_id) {
        fetchReportData();
    }
    console.log(props.restaurant_id);
});
</script>
