<script lang="ts" setup>
import { ref, onMounted, useTemplateRef } from "vue";
import { useRestaurant } from "@/composables/useRestaurant";
import { useToast } from "vue-toastification";
import type { IRestaurant } from "~/shared/interface";
import { RESTAURANT_STATUSES, type RestaurantStatus } from "~/shared/constant";

const {
    restaurants,
    page,
    totalPages,
    hasMore,
    loading,
    searchTerm,
    statusFilter,
    minRatingFilter,
    sortBy,
    sortOrder,
    fetchRestaurants,
    updateExistingRestaurant,
    removeRestaurant,
} = useRestaurant();

const toast = useToast();
const closeDeleteModalBtn = useTemplateRef("closeDeleteModalBtn");

const selectedRestaurant = ref<IRestaurant | null>(null);
const deletingId = ref<string | null>(null);

// Fetch restaurants on mount
onMounted(() => {
    fetchRestaurants(true);
});

// Show modals
const showDetailsModal = (restaurant: IRestaurant) => {
    selectedRestaurant.value = restaurant;
    const modal = document.getElementById("details_modal") as HTMLDialogElement;
    if (modal) modal.showModal();
};

const showDeleteModal = (id: string) => {
    deletingId.value = id;
    const modal = document.getElementById("delete_modal") as HTMLDialogElement;
    if (modal) modal.showModal();
};

// Restaurant actions
const handleUpdateStatus = async (restaurant: IRestaurant) => {
    try {
        const currentStatus = restaurant.status;
        const restaurantId = restaurant._id;
        let updateStatus = "";
        if (currentStatus !== RESTAURANT_STATUSES.SUSPENDED) {
            updateStatus = RESTAURANT_STATUSES.SUSPENDED;
        } else {
            updateStatus = RESTAURANT_STATUSES.CLOSING;
        }

        await updateExistingRestaurant(restaurantId, { status: updateStatus });
        toast.success(updateStatus !== RESTAURANT_STATUSES.SUSPENDED ? "Đã mở khoá nhà hàng" : "Đã khoá nhà hàng");
        if (selectedRestaurant.value && selectedRestaurant.value._id === restaurantId) {
            selectedRestaurant.value.status = updateStatus as RestaurantStatus;
        }
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    }
};

const handleDelete = async () => {
    if (!deletingId.value) return;
    try {
        await removeRestaurant(deletingId.value);
        toast.success("Đã xóa nhà hàng thành công");
        deletingId.value = null;
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Lỗi khi xóa nhà hàng");
    } finally {
        closeDeleteModalBtn.value?.click();
    }
};

// Pagination
const nextPage = () => {
    if (page.value < totalPages.value) {
        page.value++;
    }
};

const prevPage = () => {
    if (page.value > 1) {
        page.value--;
    }
};
</script>

<template>
    <div class="p-4">
        <h1 class="text-xl font-bold mb-4">Quản lý Nhà Hàng</h1>

        <!-- Filters -->
        <div class="flex gap-4 mb-4 flex-wrap">
            <button @click="fetchRestaurants(true)" class="btn btn-outline" :disabled="loading">
                <i class="fa-solid fa-rotate"></i> Làm mới
            </button>
            <input v-model="searchTerm" placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
                class="input input-bordered w-1/3" />
            <select v-model="statusFilter" class="select select-bordered">
                <option value="">Tất cả trạng thái</option>
                <option :value="RESTAURANT_STATUSES.OPENING">Đang hoạt động</option>
                <option :value="RESTAURANT_STATUSES.CLOSING">Không hoạt động</option>
                <option :value="RESTAURANT_STATUSES.SUSPENDED">Bị khoá</option>
            </select>
            <input v-model.number="minRatingFilter" type="number" min="0" max="5"
                placeholder="Điểm đánh giá tối thiểu" class="input input-bordered w-32" />
            <select v-model="sortBy" class="select select-bordered">
                <option value="createdAt">Ngày tạo</option>
                <option value="rating">Điểm đánh giá</option>
            </select>
            <select v-model="sortOrder" class="select select-bordered">
                <option value="asc">Tăng dần</option>
                <option value="desc">Giảm dần</option>
            </select>
        </div>

        <!-- Restaurants Table -->
        <table v-if="!loading" class="table w-full mt-4 border">
            <thead>
                <tr class="bg-gray-200">
                    <th>Tên Nhà Hàng</th>
                    <th>Số Điện Thoại</th>
                    <th>Điểm Đánh Giá</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="restaurant in restaurants" :key="restaurant._id">
                    <td>{{ restaurant.name }}</td>
                    <td>{{ restaurant.phone || "Chưa có" }}</td>
                    <td>{{ restaurant.rating || 0 }}</td>
                    <td>
                        <span :class="{
                            'badge badge-success': restaurant.status === RESTAURANT_STATUSES.OPENING,
                            'badge badge-warning': restaurant.status === RESTAURANT_STATUSES.CLOSING,
                            'badge badge-error': restaurant.status === RESTAURANT_STATUSES.SUSPENDED,
                        }">
                            {{ restaurant.status }}
                        </span>
                    </td>
                    <td>
                        <button @click="showDetailsModal(restaurant)" class="btn btn-info btn-sm mr-2">Chi tiết</button>
                        <!-- <button @click="showDeleteModal(restaurant._id)" class="btn btn-error btn-sm">Xóa</button> -->
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-else class="text-center py-4">
            <span class="loading loading-spinner loading-lg"></span>
            <p>Đang tải...</p>
        </div>

        <!-- Pagination -->
        <div class="mt-4 flex justify-between">
            <button @click="prevPage" :disabled="page === 1 || loading" class="btn btn-outline">Trước</button>
            <span>Trang {{ page }} / {{ totalPages }}</span>
            <button @click="nextPage" :disabled="!hasMore || loading" class="btn btn-outline">Sau</button>
        </div>
    </div>

    <!-- Details Modal -->
    <dialog id="details_modal" class="modal">
        <div class="modal-box w-11/12 max-w-5xl">
            <div v-if="selectedRestaurant" class="grid grid-cols-2 gap-4">
                <div>
                    <p><strong>Tên Nhà Hàng:</strong> {{ selectedRestaurant.name }}</p>
                    <p><strong>Số Điện Thoại:</strong> {{ selectedRestaurant.phone || "Chưa có" }}</p>
                    <p><strong>Địa Chỉ:</strong> {{ selectedRestaurant.location?.address || "Chưa có" }}</p>
                    <p><strong>Điểm Đánh Giá:</strong> {{ selectedRestaurant.rating || 0 }}</p>
                    <p><strong>Trạng Thái:</strong>
                        <span :class="{
                            'badge badge-success': selectedRestaurant.status === RESTAURANT_STATUSES.OPENING,
                            'badge badge-warning': selectedRestaurant.status === RESTAURANT_STATUSES.CLOSING,
                            'badge badge-error': selectedRestaurant.status === RESTAURANT_STATUSES.SUSPENDED,
                        }">
                            {{ selectedRestaurant.status }}
                        </span>
                    </p>
                </div>
                <div>
                    <p><strong>Thumbnail:</strong>
                        <img v-if="selectedRestaurant.thumbnail" :src="selectedRestaurant.thumbnail"
                             alt="Thumbnail" class="w-32 h-32 object-cover" />
                        <span v-else>Chưa có</span>
                    </p>
                    <p><strong>Ngày Tạo:</strong> {{ new Date(selectedRestaurant.createdAt).toLocaleDateString() }}</p>
                    <p><strong>Chủ Sở Hữu:</strong> {{ selectedRestaurant.owner_id }}</p>
                </div>
            </div>
            <div class="modal-action flex justify-between">
                <div v-if="selectedRestaurant" class="space-x-2">
                    <button @click="handleUpdateStatus(selectedRestaurant)"
                        :class="selectedRestaurant.status !== RESTAURANT_STATUSES.SUSPENDED ? 'btn btn-error' : 'btn btn-success'"
                        :disabled="loading">
                        {{ selectedRestaurant.status !== RESTAURANT_STATUSES.SUSPENDED ? "Khoá" : "Mở khoá" }}
                    </button>
                </div>
                <form method="dialog">
                    <button class="btn">Đóng</button>
                </form>
            </div>
        </div>
    </dialog>

    <!-- Delete Confirmation Modal -->
    <dialog id="delete_modal" class="modal">
        <div class="modal-box w-11/12 max-w-2xl">
            <fieldset class="mx-auto fieldset w-lg bg-base-200 border border-base-300 p-4 rounded-box">
                <legend class="fieldset-legend text-xl font-bold">Xác Nhận Xóa</legend>
                <p class="text-lg mb-4">Bạn có chắc chắn muốn xóa nhà hàng này không?</p>
                <div class="modal-action">
                    <div v-if="loading">
                        <span class="loading loading-spinner loading-xl"></span>
                        <p>Loading</p>
                    </div>
                    <button class="btn btn-error" @click="handleDelete" :disabled="loading">Xóa</button>
                    <form method="dialog">
                        <button ref="closeDeleteModalBtn" class="btn" @click="deletingId = null"
                            :disabled="loading">Hủy</button>
                    </form>
                </div>
            </fieldset>
        </div>
    </dialog>
</template>

<style scoped>
/* Add any custom styles if needed */
</style>
