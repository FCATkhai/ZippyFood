<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { useRestaurantStore } from "@/stores/restaurantStore"; // Adjust path as needed
import { useRestaurant } from "@/composables/useRestaurant";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "vue-toastification";
import type { IRestaurant, IOpenHours, ITimeSlot } from "~/shared/interface";
import { RESTAURANT_STATUSES, type RestaurantStatus } from "~/shared/constant";

const restaurantStore = useRestaurantStore();
const authStore = useAuthStore();
const { updateExistingRestaurant } = useRestaurant();
const toast = useToast();

// Local state
const isEditing = ref(false);
const phone = ref("");
const thumbnail = ref<File | null>(null);
const address = ref("");
const name = ref("");
const openHours = ref<IOpenHours[]>([
    { day: "Monday", time_slots: [] },
    { day: "Tuesday", time_slots: [] },
    { day: "Wednesday", time_slots: [] },
    { day: "Thursday", time_slots: [] },
    { day: "Friday", time_slots: [] },
    { day: "Saturday", time_slots: [] },
    { day: "Sunday", time_slots: [] },
]);
const loading = ref(false);
const thumbnailPreview = ref<string | null>(null); // For displaying thumbnail
const togglingActive = ref(false); // Separate loading state for toggle

// Computed properties
const restaurantId = computed(() => restaurantStore.restaurant?._id);
const restaurantStatus = computed(() => restaurantStore.restaurant?.status);

// Initialize data
const loadRestaurantData = async () => {
    if (!restaurantStore.restaurant) {
        try {
            await restaurantStore.fetchRestaurant(authStore.user?._id);
        } catch (error) {
            toast.error("Không thể tải thông tin nhà hàng");
            return;
        }
    }

    if (restaurantStore.restaurant) {
        name.value = restaurantStore.restaurant.name;
        phone.value = restaurantStore.restaurant.phone || "";
        address.value = restaurantStore.restaurant.location?.address || "";
        thumbnailPreview.value = restaurantStore.restaurant.thumbnail || null;
        openHours.value = restaurantStore.restaurant.open_hours.length
            ? restaurantStore.restaurant.open_hours
            : openHours.value;
    }
};

onMounted(loadRestaurantData);

// Toggle edit mode
const toggleEdit = () => {
    isEditing.value = !isEditing.value;
    if (!isEditing.value) {
        // Reset form to original values when cancelling edit
        loadRestaurantData();
        thumbnail.value = null;
    }
};

// Toggle is_active
const toggleActive = async () => {
    if (!restaurantId.value) {
        toast.error("Không tìm thấy nhà hàng để cập nhật");
        return;
    }

    togglingActive.value = true;
    try {
        let newActiveState = "";
        if (restaurantStatus.value === RESTAURANT_STATUSES.CLOSING) {
            newActiveState = RESTAURANT_STATUSES.OPENING
        } else {
            newActiveState = RESTAURANT_STATUSES.CLOSING
        }
        const updatedData = { status: newActiveState };
        const response = await updateExistingRestaurant(restaurantId.value, updatedData);

        if (response) {
            restaurantStore.restaurant = {
                ...restaurantStore.restaurant!,
                status: newActiveState as RestaurantStatus,
            };
            toast.success(newActiveState ? "Đã kích hoạt nhà hàng" : "Đã vô hiệu hóa nhà hàng");
        }
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    } finally {
        togglingActive.value = false;
    }
};

// Add new time slot
const addTimeSlot = (dayIndex: number) => {
    openHours.value[dayIndex].time_slots.push({ start: "08:00", end: "17:00" });
};

// Remove time slot
const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    openHours.value[dayIndex].time_slots.splice(slotIndex, 1);
};

// Handle file input and update preview
const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        thumbnail.value = target.files[0];
        thumbnailPreview.value = URL.createObjectURL(thumbnail.value); // Update preview
    }
};

// Submit changes
const submitChanges = async () => {
    if (!restaurantId.value) {
        toast.error("Không tìm thấy nhà hàng để cập nhật");
        return;
    }

    loading.value = true;
    try {
        const updatedData: any = {
            name: name.value,
            phone: phone.value,
            location: {
                address: address.value,
                district: restaurantStore.restaurant?.location?.district || "",
                province: restaurantStore.restaurant?.location?.province || "",
                province_code: restaurantStore.restaurant?.location?.province_code || "",
                coordinates: restaurantStore.restaurant?.location?.coordinates || { lat: 0, lng: 0 },
            },
            open_hours: openHours.value,
            status: restaurantStatus.value, // Preserve current status
        };

        if (thumbnail.value) {
            updatedData.file = thumbnail.value;
        }

        // Update via API
        const response = await updateExistingRestaurant(restaurantId.value, updatedData);

        // Update store and local state
        if (response) {
            restaurantStore.restaurant = {
                ...restaurantStore.restaurant!,
                ...response,
                location: { ...restaurantStore.restaurant!.location, address: address.value },
            };
            thumbnailPreview.value = response.thumbnail || thumbnailPreview.value; // Update thumbnail
            isEditing.value = false; // Exit edit mode
            toast.success("Đã cập nhật thông tin nhà hàng thành công");
        }
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Lỗi khi cập nhật nhà hàng");
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="p-4 max-w-4xl mx-auto">
        <!-- Thumbnail Display -->
        <div class="mb-6 text-center">
            <img v-if="thumbnailPreview" :src="thumbnailPreview" alt="Restaurant Thumbnail"
                class="w-200 object-cover rounded-lg mx-auto border" />
            <p v-else class="text-gray-500">Chưa có ảnh thumbnail</p>
        </div>

        <h1 class="text-2xl font-bold mb-6">Quản Lý Nhà Hàng</h1>

        <!-- Edit and Toggle Buttons -->
        <div class="mb-4 flex justify-between">
            <button @click="toggleActive" :class="restaurantStatus === RESTAURANT_STATUSES.CLOSING ? 'btn btn-warning' : 'btn btn-success'"
                :disabled="togglingActive || loading">
                <span v-if="togglingActive" class="loading loading-spinner"></span>
                {{ togglingActive ? "Đang xử lý..." : restaurantStatus === RESTAURANT_STATUSES.CLOSING ? "Đóng cửa hàng" : "Mở cửa hàng" }}
            </button>
            <button @click="toggleEdit" class="btn btn-primary" :disabled="loading || togglingActive">
                {{ isEditing ? "Hủy" : "Chỉnh sửa" }}
            </button>
        </div>

        <!-- Restaurant Info -->
        <div class="space-y-6">
            <!-- Restaurant Name -->
            <div class="form-control">
                <label class="label">
                    <span class="label-text">Tên Nhà Hàng</span>
                </label>
                <input v-if="isEditing" v-model="name" type="text" class="input input-bordered" required
                    placeholder="Nhập tên nhà hàng" />
                <p v-else class="text-lg">{{ name }}</p>
            </div>

            <!-- Phone -->
            <div class="form-control">
                <label class="label">
                    <span class="label-text">Số Điện Thoại</span>
                </label>
                <input v-if="isEditing" v-model="phone" type="tel" class="input input-bordered" required
                    placeholder="Nhập số điện thoại" />
                <p v-else class="text-lg">{{ phone || "Chưa có" }}</p>
            </div>

            <!-- Address -->
            <div class="form-control">
                <label class="label">
                    <span class="label-text">Địa Chỉ</span>
                </label>
                <input v-if="isEditing" v-model="address" type="text" class="input input-bordered" required
                    placeholder="Nhập địa chỉ" />
                <p v-else class="text-lg">{{ address || "Chưa có" }}</p>
            </div>

            <!-- Thumbnail Upload (only in edit mode) -->
            <div v-if="isEditing" class="form-control">
                <label class="label">
                    <span class="label-text">Ảnh Thumbnail</span>
                </label>
                <input type="file" accept="image/*" @change="handleFileChange" class="file-input file-input-bordered" />
            </div>

            <!-- Open Hours -->
            <div class="form-control">
                <label class="label">
                    <span class="label-text">Giờ Mở Cửa</span>
                </label>
                <div v-for="(day, dayIndex) in openHours" :key="day.day" class="mb-4">
                    <div class="flex items-center justify-between bg-gray-100 p-2 rounded">
                        <span class="font-medium">{{ day.day }}</span>
                        <button v-if="isEditing" type="button" @click="addTimeSlot(dayIndex)"
                            class="btn btn-sm btn-primary">
                            Thêm khung giờ
                        </button>
                    </div>
                    <div v-if="day.time_slots.length" class="ml-4 mt-2 space-y-2">
                        <div v-for="(slot, slotIndex) in day.time_slots" :key="slotIndex" class="flex items-center gap-2">
                            <input v-if="isEditing" v-model="slot.start" type="time" class="input input-bordered w-32" />
                            <span v-else class="w-32">{{ slot.start }}</span>
                            <span>-</span>
                            <input v-if="isEditing" v-model="slot.end" type="time" class="input input-bordered w-32" />
                            <span v-else class="w-32">{{ slot.end }}</span>
                            <button v-if="isEditing" type="button" @click="removeTimeSlot(dayIndex, slotIndex)"
                                class="btn btn-sm btn-error">Xóa</button>
                        </div>
                    </div>
                    <p v-else class="ml-4 text-sm text-gray-500">Không hoạt động</p>
                </div>
            </div>

            <!-- Save Button (only in edit mode) -->
            <div v-if="isEditing" class="form-control mt-6">
                <button @click="submitChanges" class="btn btn-primary" :disabled="loading || togglingActive">
                    <span v-if="loading" class="loading loading-spinner"></span>
                    {{ loading ? "Đang lưu..." : "Lưu thay đổi" }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Add custom styles if needed */
</style>
