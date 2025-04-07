<template>
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div v-for="restaurant in restaurantList" :key="restaurant._id"
            class="card cursor-pointer p-2 rounded-lg shadow-lg hover:shadow-xl transition "
            @click="goToDetail(restaurant._id)">
            <img :src="restaurant.thumbnail" :alt="restaurant.name" class=" object-cover rounded-md" />
            <h3 class="mt-2 font-semibold text-center">{{ restaurant.name }}</h3>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import type { IRestaurant } from "~/shared/interface";
defineProps({
    restaurantList: Array<IRestaurant>, // Nhận danh sách sách từ component cha
});

const router = useRouter();

const goToDetail = (restaurantId: string) => {
    router.push(`/restaurant/${restaurantId}`);
};
</script>

<style scoped></style>
