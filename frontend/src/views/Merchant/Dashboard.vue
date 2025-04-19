<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p>Chào mừng {{ authStore.user?.name }} đến trang quản lý.</p>
        <MerchantDashboard :restaurant_id="restaurant_id"/>

    </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth.store";
import { computed, onMounted, ref } from "vue";
import MerchantDashboard from "@/components/MerchantDashboard.vue";
import { useRestaurantStore } from "@/stores/restaurantStore";
const restaurantStore = useRestaurantStore();
const restaurant_id = computed(() => restaurantStore.restaurant._id);
const authStore = useAuthStore();

console.log(restaurant_id.value);


</script>
