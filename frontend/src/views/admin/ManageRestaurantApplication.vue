<script lang="ts" setup>
import { ref, onMounted, useTemplateRef } from "vue";
import { useRestaurantApplication } from "@/composables/useRestaurantApplication";
import { useUsers } from "@/composables/useUser";
import { useToast } from "vue-toastification";
import type { IRestaurantApplication } from "~/shared/interface";
import { USER_ROLES } from "~/shared/userRoles";

const {
    applications,
    page,
    totalPages,
    hasMore,
    loading,
    searchTerm,
    statusFilter,
    sortOrder,
    fetchApplications,
    updateStatus,
    removeApplication,
} = useRestaurantApplication();

const {
    user,
    fetchUser,
    updateUserRole
} = useUsers();

const appRef = ref<IRestaurantApplication | null>(null);

const toast = useToast();
const closeDeleteModalBtn = useTemplateRef("closeDeleteModalBtn");

const selectedApplication = ref<IRestaurantApplication | null>(null);
const deletingId = ref<string | null>(null);

// Fetch applications on mount
onMounted(() => {
    fetchApplications(true);
});

// Show modals
const showInfoModal = (application: IRestaurantApplication) => {
    selectedApplication.value = application;
    const modal = document.getElementById("info_modal") as HTMLDialogElement;
    if (modal) modal.showModal();
};

const showDeleteModal = (id: string) => {
    deletingId.value = id;
    const modal = document.getElementById("delete_modal") as HTMLDialogElement;
    if (modal) modal.showModal();
};

// Application actions
const handleUpdateStatus = async (application: IRestaurantApplication, status: "approved" | "rejected") => {
    try {
        const app_id = application._id;
        await updateStatus(app_id, status);

        // Nâng hạng người dùng lên restaurant_owner nếu được duyệt
        if (status === "approved") {
            const user = await fetchUser(application.user_id._id);
            console.log(user);
            if (user) {
                await updateUserRole(user._id, USER_ROLES.RESTAURANT_OWNER);
            }
        }
        toast.success(status === "approved" ? "Đã duyệt đơn đăng ký" : "Đã từ chối đơn đăng ký");
        if (selectedApplication.value && selectedApplication.value._id === app_id) {
            selectedApplication.value.status = status;
        }
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    }
};

const handleDelete = async () => {
    if (!deletingId.value) return;
    try {
        await removeApplication(deletingId.value);
        toast.success("Đã xóa đơn đăng ký thành công");
        deletingId.value = null;
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Lỗi khi xóa đơn đăng ký");
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
        <h1 class="text-xl font-bold mb-4">Quản lý Đơn Đăng Ký Nhà Hàng</h1>

        <!-- Filters -->
        <div class="flex gap-4 mb-4">
            <button @click="fetchApplications(true)" class="btn btn-outline" :disabled="loading">
                <i class="fa-solid fa-rotate"></i> Làm mới
            </button>
            <input v-model="searchTerm" placeholder="Tìm kiếm theo tên hoặc email..."
                class="input input-bordered w-1/2" />
            <select v-model="statusFilter" class="select select-bordered">
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Bị từ chối</option>
            </select>
            <select v-model="sortOrder" class="select select-bordered">
                <option value="asc">Cũ nhất trước</option>
                <option value="desc">Mới nhất trước</option>
            </select>
        </div>

        <!-- Applications Table -->
        <table v-if="!loading" class="table w-full mt-4 border">
            <thead>
                <tr class="bg-gray-200">
                    <th>Tên Nhà Hàng</th>
                    <th>Chủ Sở Hữu</th>
                    <th>Số Điện Thoại</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="app in applications" :key="app._id">
                    <td>{{ app.restaurant_name }}</td>
                    <td>{{ app.owner_name }}</td>
                    <td>{{ app.phone }}</td>
                    <td>
                        <span :class="{
                            'badge badge-info': app.status === 'pending',
                            'badge badge-success': app.status === 'approved',
                            'badge badge-error': app.status === 'rejected',
                        }">
                            {{ app.status === "pending" ? "Chờ duyệt" : app.status === "approved" ? "Đã duyệt" : "Bị từ chối" }}
                        </span>
                    </td>
                    <td>
                        <button @click="showInfoModal(app)" class="btn btn-info btn-sm mr-2">Chi tiết</button>
                        <button v-if="app.status === 'pending'" @click="handleUpdateStatus(app, 'approved')"
                            class="btn btn-success btn-sm mr-2" :disabled="loading">
                            Duyệt
                        </button>
                        <button v-if="app.status === 'pending'" @click="handleUpdateStatus(app, 'rejected');"
                            class="btn btn-warning btn-sm mr-2" :disabled="loading">
                            Từ chối
                        </button>
                        <button @click="showDeleteModal(app._id)" class="btn btn-error btn-sm"
                            :disabled="app.status === 'approved' || loading">
                            Xóa
                        </button>
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

    <!-- Info Modal -->
    <dialog id="info_modal" class="modal">
        <div class="modal-box w-11/12 max-w-5xl">
            <div v-if="selectedApplication" class="grid grid-cols-2 gap-4">
                <div>
                    <p><strong>Tên Nhà Hàng:</strong> {{ selectedApplication.restaurant_name }}</p>
                    <p><strong>Chủ Sở Hữu:</strong> {{ selectedApplication.owner_name }}</p>
                    <p><strong>Số Điện Thoại:</strong> {{ selectedApplication.phone }}</p>
                    <p><strong>Địa Chỉ:</strong> {{ selectedApplication.address }}</p>
                    <p><strong>Trạng Thái:</strong>
                        <span :class="{
                            'badge badge-info': selectedApplication.status === 'pending',
                            'badge badge-success': selectedApplication.status === 'approved',
                            'badge badge-error': selectedApplication.status === 'rejected',
                        }">
                            {{ selectedApplication.status === "pending" ? "Chờ duyệt" : selectedApplication.status ===
                                "approved" ? "Đã duyệt" : "Bị từ chối" }}
                        </span>
                    </p>
                </div>
                <div>
                    <p><strong>Căn Cước Công Dân:</strong> <a :href="selectedApplication.identify_document"
                            target="_blank">Xem</a></p>
                    <p><strong>Giấy Phép Kinh Doanh:</strong> <a :href="selectedApplication.business_license"
                            target="_blank">Xem</a></p>
                    <p><strong>Chứng Nhận An Toàn Thực Phẩm:</strong> <a
                            :href="selectedApplication.food_safety_certificate" target="_blank">Xem</a></p>
                    <p><strong>Người Gửi:</strong> {{ selectedApplication.user_id?.name }} ({{
                        selectedApplication.user_id?.email }})</p>
                </div>
            </div>
            <div class="modal-action flex justify-between">
                <div v-if="selectedApplication" class="space-x-2">
                    <button v-if="selectedApplication.status === 'pending'"
                        @click="handleUpdateStatus(selectedApplication._id, 'approved')" class="btn btn-success"
                        :disabled="loading">
                        Duyệt
                    </button>
                    <button v-if="selectedApplication.status === 'pending'"
                        @click="handleUpdateStatus(selectedApplication._id, 'rejected')" class="btn btn-warning"
                        :disabled="loading">
                        Từ chối
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
                <p class="text-lg mb-4">Bạn có chắc chắn muốn xóa đơn đăng ký này không?</p>
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
