<template>
    <Navbar />
    <div class="flex min-h-screen">
        <!-- Sidebar -->
        <div class="drawer lg:drawer-open">
            <input id="my-drawer" type="checkbox" class="drawer-toggle" />
            <div class="drawer-content">
                <!-- Page content here -->
                <label for="my-drawer" class="btn btn--soft drawer-button lg:hidden">
                    <i class="fa-solid fa-bars text-lg"></i>
                </label>
                <div class="flex flex-col items-center">
                    <RouterView />
                </div>
            </div>
            <div class="drawer-side">
                <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
                <ul class="menu bg-base-200 text-base-content min-h-full w-60 p-4">
                    <!-- Sidebar content here -->
                    <h2 class="text-xl font-bold mb-2">Quản lý</h2>

                    <li><RouterLink to="/admin" class="block py-2"><i class="fa-solid fa-chart-simple"></i> Dashboard</RouterLink></li>
                    <li><RouterLink to="/admin/restaurant-application" class="block py-2"><i class="fa-solid fa-building-user"></i> Quản lý Đơn ĐK</RouterLink></li>
                    <li><RouterLink to="/admin/restaurant" class="block py-2"><i class="fa-solid fa-building-user"></i> Quản lý Nhà Hàng</RouterLink></li>
                    <li><RouterLink to="/admin/order" class="block py-2"><i class="fa-solid fa-receipt"></i> Quản lý Đơn Hàng</RouterLink></li>
                </ul>
            </div>
        </div>
    </div>
</template>


<script lang="ts" setup>
import Navbar from "@/components/Navbar.vue";
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { USER_ROLES } from "~/shared/userRoles";

const authStore = useAuthStore();
const isManager = computed(() => authStore.user?.role === USER_ROLES.ADMIN);
</script>
