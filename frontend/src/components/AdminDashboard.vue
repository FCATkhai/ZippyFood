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
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="stat bg-base-100 shadow">
                    <div class="stat-figure text-primary">
                        <i class="fa-solid fa-store text-3xl"></i>
                    </div>
                    <div class="stat-title">Nhà hàng đang mở</div>
                    <div class="stat-value text-primary">{{ currentStats.opening_restaurants }}</div>
                    <div class="stat-desc">Đang hoạt động</div>
                </div>

                <div class="stat bg-base-100 shadow">
                    <div class="stat-figure text-accent">
                        <i class="fa-solid fa-utensils text-3xl"></i>
                    </div>
                    <div class="stat-title">Tổng nhà hàng</div>
                    <div class="stat-value text-accent">{{ currentStats.total_restaurants }}</div>
                    <div class="stat-desc">Đã đăng ký</div>
                </div>

                <div class="stat bg-base-100 shadow">
                    <div class="stat-figure text-secondary">
                        <i class="fa-solid fa-users text-3xl"></i>
                    </div>
                    <div class="stat-title">Tổng người dùng</div>
                    <div class="stat-value text-secondary">{{ currentStats.total_users }}</div>
                    <div class="stat-desc">Đã đăng ký</div>
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
                                <div class="stat-title">Tổng đơn hàng</div>
                                <div class="stat-value text-primary">{{ stats.daily?.total_orders || 0 }}</div>
                            </div>

                            <div class="stat">
                                <div class="stat-title">Tổng doanh thu</div>
                                <div class="stat-value text-secondary">{{ formatCurrency(stats.daily?.total_revenue ||
                                    0) }} đ</div>
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
                                                <th>Nhà hàng</th>
                                                <th class="text-right">Số lượng</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="product in stats.daily.top_products" :key="product.product_id">
                                                <td>{{ product.name }}</td>
                                                <td class="text-sm opacity-70">{{
                                                    getRestaurantNameById(product.restaurant_id) }}</td>
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
                                <div class="stat-title">Tổng đơn hàng</div>
                                <div class="stat-value text-primary">{{ stats.monthly?.total_orders || 0 }}</div>
                            </div>

                            <div class="stat">
                                <div class="stat-title">Tổng doanh thu</div>
                                <div class="stat-value text-secondary">{{ formatCurrency(stats.monthly?.total_revenue ||
                                    0) }} đ</div>
                            </div>
                        </div>

                        <div class="mt-4">
                            <canvas ref="monthlyRevenueChart" height="200" class="mb-6"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Top Products Chart -->
            <div class="card bg-base-100 shadow-xl mb-6">
                <div class="card-body">
                    <h2 class="card-title">
                        <i class="fa-solid fa-crown mr-2"></i>Top sản phẩm bán chạy trong tháng
                    </h2>
                    <div class="mt-4">
                        <canvas ref="topProductsChart" height="300"></canvas>
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
                                    <th>Đơn hàng</th>
                                    <th>Doanh thu</th>
                                    <th>Người dùng</th>
                                    <th>Nhà hàng</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="report in history.data" :key="report._id">
                                    <td>{{ formatDate(report.report_date) }}</td>
                                    <td>{{ report.period === 'daily' ? 'Ngày' : 'Tháng' }}</td>
                                    <td>{{ report.total_orders }}</td>
                                    <td>{{ formatCurrency(report.total_revenue) }} đ</td>
                                    <td>{{ report.total_users }}</td>
                                    <td>{{ report.total_restaurants }}</td>
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
import { ref, reactive, onMounted, nextTick } from 'vue';
import { useAdminReports } from '@/composables/admin/useAdminReport';
import Chart from 'chart.js/auto';
import { useToast } from 'vue-toastification';

// Setup toast
const toast = useToast();

// Setup chart references
const monthlyRevenueChart = ref(null);
const topProductsChart = ref(null);
let revenueChartInstance = null;
let productsChartInstance = null;

// Setup mock restaurant data (you should replace this with actual data)
const restaurants = reactive({
    map: new Map()
});

// Setup admin reports composable
const {
    stats,
    currentStats,
    history,
    loading,
    error,
    fetchStats,
    fetchCurrentStats,
    fetchReportHistory
} = useAdminReports();

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

const getRestaurantNameById = (id) => {
    // This is a mock function - in real implementation,
    // you might want to fetch restaurant names from an API
    // or store them in a Vuex/Pinia store
    if (!restaurants.map.has(id)) {
        restaurants.map.set(id, `Nhà hàng #${id.toString().slice(-4)}`);
    }
    return restaurants.map.get(id);
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
            fetchStats(),
            fetchCurrentStats(),
            fetchReportHistory({
                start_date: filterParams.start_date || undefined,
                end_date: filterParams.end_date || undefined,
                period: filterParams.period || undefined,
                page: filterParams.page,
                limit: filterParams.limit
            })
        ]);

        // Create charts after data is loaded
        nextTick(() => {
            renderMonthlyRevenueChart();
            renderTopProductsChart();
        });
    } catch (err) {
        toast.error('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
        console.error('Error loading stats:', err);
    }
};

const renderMonthlyRevenueChart = () => {
    if (!monthlyRevenueChart.value) return;

    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }

    // Mock data for the last 30 days revenue trend
    // In a real implementation, you would use actual data from your API
    const ctx = monthlyRevenueChart.value.getContext('2d');

    // Generate dates for the last 30 days
    const dates = [];
    const revenues = [];
    const orders = [];

    // Generate some sample data - in real implementation, get this from API
    for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));

        // Random revenue between 5M and 25M
        revenues.push(Math.floor(Math.random() * 20000000) + 5000000);

        // Random orders between 50 and 200
        orders.push(Math.floor(Math.random() * 150) + 50);
    }

    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Doanh thu',
                    data: revenues,
                    borderColor: 'rgba(52, 152, 219, 1)',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Đơn hàng',
                    data: orders,
                    borderColor: 'rgba(231, 76, 60, 1)',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Xu hướng doanh thu và đơn hàng',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            if (context.dataset.label === 'Doanh thu') {
                                return `Doanh thu: ${formatCurrency(context.raw)} đ`;
                            }
                            return `Đơn hàng: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Doanh thu (VND)'
                    },
                    ticks: {
                        callback: function (value) {
                            if (value >= 1000000) {
                                return value / 1000000 + 'M';
                            }
                            return value;
                        }
                    }
                },
                y1: {
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Số đơn hàng'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
};

const renderTopProductsChart = () => {
    if (!stats.monthly?.top_products?.length || !topProductsChart.value) return;

    if (productsChartInstance) {
        productsChartInstance.destroy();
    }

    const ctx = topProductsChart.value.getContext('2d');
    const topProductsData = stats.monthly.top_products.slice(0, 10); // Get top 10 products

    const labels = topProductsData.map(product => product.name);
    const data = topProductsData.map(product => product.totalSold);
    const restaurants = topProductsData.map(product => getRestaurantNameById(product.restaurant_id));

    // Random colors for the chart
    const backgroundColors = topProductsData.map(() =>
        `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
    );

    productsChartInstance = new Chart(ctx, {
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
            indexAxis: 'y',
            plugins: {
                title: {
                    display: true,
                    text: 'Top sản phẩm bán chạy',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function (context) {
                            const index = context.dataIndex;
                            return `Nhà hàng: ${restaurants[index]}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
};

// Initial data fetch
onMounted(() => {
    fetchReportData();
});
</script>
