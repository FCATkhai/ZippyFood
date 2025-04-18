<template>
    <!-- Navbar -->
    <nav class="navbar justify-between bg-base-300">
        <!-- Logo -->
        <a class="link w-40">
            <RouterLink to="/"><img alt="Logo" src="@/assets/Logo-Extend.svg" /></RouterLink>
        </a>

        <!-- Menu for mobile -->
        <div class="dropdown dropdown-end sm:hidden">
            <button class="btn btn-soft">
                <i class="fa-solid fa-bars text-lg"></i>
            </button>

            <ul tabindex="0" class="dropdown-content menu z-[1] bg-base-200 p-6 rounded-box shadow w-56 gap-2">
                <li>
                    <RouterLink to="/about">About</RouterLink>
                </li>
                <li>
                    <RouterLink to="/contact">Contact</RouterLink>
                </li>
                <li v-if="role === USER_ROLES.ADMIN">
                    <RouterLink to="/admin">Quản lý</RouterLink>
                </li>
                <div v-if="authStore.isAuthenticated">
                    <!-- <li class="mb-2">
                        <RouterLink :to="profileLink">Hồ sơ</RouterLink>
                    </li> -->
                    <li>
                        <RouterLink @click="authStore.logout" to="/" class="bg-error color-base text-base-100">Logout
                        </RouterLink>
                    </li>
                </div>
                <RouterLink v-else to="/login" class="btn btn-sm btn-primary">Login</RouterLink>
            </ul>
        </div>

        <!-- Menu for desktop -->
        <ul class="hidden menu sm:menu-horizontal gap-2">
            <li>
                <RouterLink to="/About">Giới thiệu</RouterLink>
            </li>
            <li>
                <RouterLink to="/contact">Liên hệ</RouterLink>
            </li>

            <li v-if="role === USER_ROLES.ADMIN">
                <RouterLink to="/admin">Quản lý</RouterLink>
            </li>
            <li v-if="role === USER_ROLES.RESTAURANT_OWNER">
                <RouterLink to="/restaurant-manage">Quản lý</RouterLink>
            </li>
            <!-- Notification icon -->
            <template v-if="authStore.isAuthenticated">
                <NotificationIcon />
            </template>
            <template v-if="authStore.isAuthenticated">
                <CardIcon />

                <div class="dropdown dropdown-end">
                    <div tabindex="2" role="button" class="btn btn-ghost btn-circle avatar">
                        <div class="w-10 rounded-full align-middle">
                            <i class="fa-solid fa-user text-2xl pt-2"></i>
                        </div>
                    </div>
                    <ul tabindex="2"
                        class="menu menu-md dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        <!-- <li class="mb-2">
                            <RouterLink :to="profileLink">Hồ sơ</RouterLink>
                        </li> -->
                        <li class="mb-2">
                            <RouterLink to="/order-history">Xem đơn hàng</RouterLink>
                        </li>

                        <li>
                            <RouterLink @click="handleLogout" to="/" class="bg-error color-base text-base-100">
                                Logout
                            </RouterLink>
                        </li>
                    </ul>
                </div>
            </template>
            <RouterLink v-else to="/login" class="btn btn-sm btn-primary">Login</RouterLink>
        </ul>
    </nav>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import { USER_ROLES } from '~/shared/userRoles';
import CardIcon from './CartIcon.vue';
import NotificationIcon from './NotificationIcon.vue';

const authStore = useAuthStore();

const router = useRouter();
const route = useRoute();


// const profileLink = computed(() => {
//     return user.value?.role === USER_ROLES.NHANVIEN || user.value?.role === USER_ROLES.QUANLY
//         ? "/admin/profile"
//         : "/profile";
// });

const user = computed(() => authStore.user);

const role = computed(() => user.value?.role);

const handleLogout = async () => {
    await authStore.logout();
}



</script>

<style scoped></style>
