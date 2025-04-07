<template>
    <div class="container mx-auto p-6 max-w-2xl">
        <h2 class="text-2xl font-bold text-center mb-4">Đăng Ký Nhà Hàng</h2>
        <form @submit.prevent="submitForm" class="space-y-4">
            <label class="form-control w-full">
                <span class="label-text">Tên Nhà Hàng</span>
                <input v-model="form.restaurant_name" type="text" class="input input-bordered w-full" required />
            </label>

            <label class="form-control w-full">
                <span class="label-text">Tên Chủ Nhà Hàng</span>
                <input v-model="form.owner_name" type="text" class="input input-bordered w-full" required />
            </label>

            <label class="form-control w-full">
                <span class="label-text">Số Điện Thoại</span>
                <input v-model="form.phone" type="tel" class="input input-bordered w-full" required />
            </label>

            <label class="form-control w-full">
                <span class="label-text">Địa Chỉ</span>
                <input v-model="form.address" type="text" class="input input-bordered w-full" required />
            </label>

            <label class="form-control w-full">
                <span class="label-text">Giấy CCCD</span>
                <input type="file" @change="handleFileUpload($event, 'identify_document')"
                    class="file-input file-input-bordered w-full" required />
            </label>

            <label class="form-control w-full">
                <span class="label-text">Giấy Phép Kinh Doanh</span>
                <input type="file" @change="handleFileUpload($event, 'business_license')"
                    class="file-input file-input-bordered w-full" required />
            </label>

            <label class="form-control w-full">
                <span class="label-text">Chứng Nhận An Toàn Thực Phẩm</span>
                <input type="file" @change="handleFileUpload($event, 'food_safety_certificate')"
                    class="file-input file-input-bordered w-full" required />
            </label>

            <button type="submit" class="btn btn-primary w-full" :disabled="loading">
                {{ loading ? "Đang gửi..." : "Gửi Đăng Ký" }}
            </button>
        </form>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRestaurantApplication } from "@/composables/useRestaurantApplication";

const { submitApplication, loading } = useRestaurantApplication();

const form = ref({
    restaurant_name: "",
    owner_name: "",
    phone: "",
    address: "",
    identify_document: null,
    business_license: null,
    food_safety_certificate: null,
});

const handleFileUpload = (event, field) => {
    const file = event.target.files[0];
    if (file) {
        form.value[field] = file;
    }
};

const submitForm = async () => {
    try {
        await submitApplication(form.value);
        alert("Đăng ký thành công! Hệ thống sẽ xét duyệt đơn của bạn.");
    } catch (error) {
        alert("Đăng ký thất bại, vui lòng thử lại.");
    }
};
</script>
