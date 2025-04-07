<template>
    <div class="container mx-auto p-4">
        <!-- Ô tìm kiếm -->
        <input v-model="searchTerm" type="text" placeholder="Tìm kiếm nhà hàng hoặc món ăn..."
            class="input input-bordered w-full mb-4" />
        <RestaurantList :restaurant-list="restaurants" />

        <div v-if="loading" class="text-center text-blue-500">Đang tải...</div>
        <div v-if="!hasMore && restaurants.length > 0" class="text-center text-gray-500">Hết nhà hàng</div>
        <div v-if="!loading && restaurants.length === 0" class="text-center text-red-500">Hãy thử tìm từ khoá khác</div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, watchEffect } from "vue";
import { useRestaurant } from "@/composables/customer/useRestaurantCustomer";
import RestaurantList from "@/components/RestaurantList.vue";

const { restaurants, fetchRestaurants, page, hasMore, loading, searchTerm } = useRestaurant();

const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        page.value++;
        fetchRestaurants();
    }
};

onMounted(() => {
    fetchRestaurants();
    window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>

</style>
