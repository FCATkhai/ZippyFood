<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p>Chào mừng {{ authStore.user?.name }} đến trang quản lý.</p>


    </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth.store";
import { onMounted, ref } from "vue";

const authStore = useAuthStore();



</script>
