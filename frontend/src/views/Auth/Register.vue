<template>
    <div class="flex justify-center items-center min-h-screen bg-gray-100">
        <div class="p-6 max-w-md lg:w-lg bg-white rounded-lg shadow-lg">
            <h2 class="text-2xl font-semibold text-center mb-4">Đăng Ký</h2>

            <div class="mb-3">
                <label class="block font-medium">Tên<span class="text-error">*</span></label>
                <input v-model="name" type="text" class="input validator w-full p-2" placeholder="Nhập tên của bạn" />
            </div>

            <div class="mb-3">
                <label class="block">Email<span class="text-error">*</span></label>
                <input v-model="email" class="input validator w-full p-2" type="email" required placeholder="Email" />
                <div class="hidden validator-hint">Xin nhập Email đúng định dạng</div>
            </div>

            <div class="mb-3">
                <label class="block font-medium">Số điện thoại<span class="text-error">*</span></label>
                <input v-model="phone" type="tel" class="input validator tabular-nums w-full p-2 "
                    pattern="[0-9]*" minlength="10" maxlength="10" title="Số điện thoại phải là 10 con số"
                    placeholder="Nhập số điện thoại" />
                <p class="hidden validator-hint">Số điện thoại phải là 10 con số</p>
            </div>

            <div class="mb-3">
                <label class="block font-medium">Mật khẩu<span class="text-error">*</span></label>
                <input v-model="password" type="password" class="input validator w-full p-2" pattern="^[A-Za-z0-9]{5,}$"
                    title="Mật khẩu phải có ít nhất 5 ký tự và không chứa ký tự đặc biệt" placeholder="Nhập mật khẩu" />
                <p class="hidden validator-hint">Mật khẩu phải có ít nhất 5 ký tự và không chứa ký tự đặc biệt</p>
            </div>

            <div class="mb-3">
                <label class="block font-medium">Địa chỉ</label>
                <input v-model="address" type="text" class="w-full p-2 border rounded" placeholder="Nhập địa chỉ" />
            </div>

            <p v-if="errorMsg" class="text-red-500 text-center">{{ errorMsg }}</p>
            <p v-if="successMsg" class="text-green-500 text-center">{{ successMsg }}</p>

            <button @click="handleRegister" class="w-full mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                :disabled="loading">
                {{ loading ? "Đang đăng ký..." : "Đăng Ký" }}
            </button>

            <p class="text-center mt-3">
                Đã có tài khoản?
                <router-link to="/login" class="text-blue-500 underline">Đăng nhập</router-link>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useUsers } from "@/composables/useUser";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";

const { addUser } = useUsers();
const toast = useToast();
const router = useRouter();

const name = ref("");
const phone = ref("");
const password = ref("");
const email = ref("");
const address = ref("");

const errorMsg = ref("");
const successMsg = ref("");

const handleRegister = async () => {
    if (!name.value || !email.value || !phone.value || !password.value) {
        errorMsg.value = "Vui lòng điền đầy đủ thông tin!";
        return;
    }

    errorMsg.value = "";
    successMsg.value = "";

    try {
        await addUser({
            name: name.value,
            email: email.value,
            phone: phone.value,
            password: password.value,
            address: [address.value] || undefined,
        });

        successMsg.value = "🎉 Đăng ký thành công! Chuyển hướng...";
        toast.success("Đăng ký thành công!");

        setTimeout(() => {
            router.push("/login");
        }, 2000);
    } catch (error) {
        // console.error(error);
        errorMsg.value = error?.response?.data?.message || "Đăng ký thất bại!";
        toast.error("Đăng ký thất bại!");
    }
};
</script>
