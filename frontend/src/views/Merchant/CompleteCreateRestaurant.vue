<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { useRestaurant } from "@/composables/useRestaurant";
import { useToast } from "vue-toastification";
import type { IRestaurant, IOpenHours, ITimeSlot } from "~/shared/interface";

import { useAuthStore } from "@/stores/auth.store";
const authStore = useAuthStore();

const restaurantStore = useRestaurantStore();
const { updateExistingRestaurant } = useRestaurant();
const toast = useToast();

// Local state
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


// Computed property to check if restaurant exists
const restaurantId = computed(() => restaurantStore.restaurant?._id);

// Initialize form with existing restaurant data
onMounted(async () => {
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
        thumbnail.value = null;
        openHours.value = restaurantStore.restaurant.open_hours.length
            ? restaurantStore.restaurant.open_hours
            : openHours.value;
    }
});

// Add new time slot
const addTimeSlot = (dayIndex: number) => {
    openHours.value[dayIndex].time_slots.push({ start: "08:00", end: "17:00" });
};

// Remove time slot
const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    openHours.value[dayIndex].time_slots.splice(slotIndex, 1);
};

// Handle file input
const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        thumbnail.value = target.files[0];
    }
};

// Submit form
const submitSetup = async () => {
    if (!restaurantId.value) {
        toast.error("Không tìm thấy nhà hàng để cập nhật");
        return;
    }

    loading.value = true;
    try {
        const updatedData: any = {
            name: name.value,
            phone: phone.value,
            location: { address: address.value },
            open_hours: openHours.value,
            is_active: true,
        };

        if (thumbnail.value) {
            updatedData.file = thumbnail.value;
        }

        // Update via API
        const response = await updateExistingRestaurant(restaurantId.value, updatedData);

        // Update store
        if (response) {
            restaurantStore.restaurant = {
                ...restaurantStore.restaurant!,
                ...response,
                location: { ...restaurantStore.restaurant!.location, address: address.value },
            };
            toast.success("Đã thiết lập nhà hàng thành công");
        }
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Lỗi khi thiết lập nhà hàng");
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="p-4 max-w-4xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">Thiết Lập Nhà Hàng</h1>

        <form @submit.prevent="submitSetup" class="space-y-6">
            <!-- Restaurant Name -->
            <div class="form-control">
                <label class="label">
                    <span class="label-text">Tên Nhà Hàng</span>
                </label>
                <input v-model="name" type="text" class="input input-bordered" required
                    placeholder="Nhập tên nhà hàng" />
            </div>

            <!-- Phone -->
            <div class="form-control">
                <label class="label">
                    <span class="label-text">Số Điện Thoại</span>
                </label>
                <input v-model="phone" type="tel" class="input input-bordered" required
                    placeholder="Nhập số điện thoại" />
            </div>

            <!-- Address -->
            <div class="form-control">
                <label class="label">
                    <span class="label-text">Địa Chỉ</span>
                </label>
                <input v-model="address" type="text" class="input input-bordered" required
                    placeholder="Nhập địa chỉ" />
            </div>

            <!-- Thumbnail -->
            <div class="form-control">
                <label class="label">
                    <span class="label-text">Ảnh Thumbnail</span>
                </label>
                <input type="file" accept="image/*" @change="handleFileChange" class="file-input file-input-bordered" />
                <div v-if="restaurantStore.restaurant?.thumbnail" class="mt-2">
                    <img :src="restaurantStore.restaurant.thumbnail" alt="Current thumbnail"
                        class="w-32 h-32 object-cover rounded" />
                    <p class="text-sm text-gray-500">Ảnh hiện tại (sẽ bị thay thế nếu chọn ảnh mới)</p>
                </div>
            </div>

            <!-- Open Hours -->
            <div class="form-control">
                <label class="label">
                    <span class="label-text">Giờ Mở Cửa</span>
                </label>
                <div v-for="(day, dayIndex) in openHours" :key="day.day" class="mb-4">
                    <div class="flex items-center justify-between bg-gray-100 p-2 rounded">
                        <span class="font-medium">{{ day.day }}</span>
                        <button type="button" @click="addTimeSlot(dayIndex)" class="btn btn-sm btn-primary">
                            Thêm khung giờ
                        </button>
                    </div>
                    <div v-if="day.time_slots.length" class="ml-4 mt-2 space-y-2">
                        <div v-for="(slot, slotIndex) in day.time_slots" :key="slotIndex" class="flex items-center gap-2">
                            <input v-model="slot.start" type="time" class="input input-bordered w-32" />
                            <span>-</span>
                            <input v-model="slot.end" type="time" class="input input-bordered w-32" />
                            <button type="button" @click="removeTimeSlot(dayIndex, slotIndex)"
                                class="btn btn-sm btn-error">Xóa</button>
                        </div>
                    </div>
                    <p v-else class="ml-4 text-sm text-gray-500">Không hoạt động</p>
                </div>
            </div>

            <!-- Submit Button -->
            <div class="form-control mt-6">
                <button type="submit" class="btn btn-primary" :disabled="loading">
                    <span v-if="loading" class="loading loading-spinner"></span>
                    {{ loading ? "Đang lưu..." : "Lưu và Kích hoạt" }}
                </button>
            </div>
        </form>
    </div>
</template>

<style scoped>
</style>
