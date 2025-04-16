<template>
    <div class="dropdown dropdown-end">
        <!-- Notification Bell Button -->
        <div tabindex="1" role="button" class="btn btn-ghost btn-circle relative">
            <div class="indicator">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span v-if="notification.unreadCount.value > 0" class="badge badge-sm badge-primary indicator-item">
                    {{ notification.unreadCount.value }}
                </span>
            </div>
        </div>

        <!-- Dropdown Menu -->
        <ul v-if="notification.notifications.value.length > 0" tabindex="1"
            class="menu dropdown-content bg-base-100 rounded-box z-[1] mt-2 w-72 p-2 shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
            <li v-for="noti in notification.notifications.value" :key="noti._id"
                class="mb-2 hover:bg-gray-100 rounded-md transition-colors">
                <a @click="handleNotificationClick(noti)" class="flex flex-col p-2 cursor-pointer"
                    :class="{ 'opacity-50': noti.is_read }">
                    <span class="font-semibold text-sm">{{ noti.title }}</span>
                    <span class="text-xs text-gray-600 truncate">{{ noti.content }}</span>
                </a>
            </li>
            <li class="border-t border-gray-200 pt-2">
                <router-link to="/notifications" class="text-center text-sm text-blue-600 hover:text-blue-800">
                    Xem thêm
                </router-link>
            </li>
        </ul>
        <div v-else-if="notification.loading.value"
            class="dropdown-content bg-base-100 rounded-box z-[1] mt-2 w-72 p-4 shadow-lg text-center">
            <span class="text-sm text-gray-500">Loading...</span>
        </div>
        <div v-else class="dropdown-content bg-base-100 rounded-box z-[1] mt-2 w-72 p-4 shadow-lg text-center">
            <span class="text-sm text-gray-500">No notifications</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { useNotification } from "@/composables/useNotification";
import type { INotification } from "~/shared/interface";

const authStore = useAuthStore();
const router = useRouter();
const notification = useNotification();

const isAuthenticated = computed(() => authStore.isAuthenticated);

// Fetch notifications when clicking the bell
const handleFetchNotifications = async () => {
    //TODO: fix error does not fetch notifications
    console.log("Fetching notifications...");
    if (isAuthenticated.value) {
        await notification.fetchNotifications(1, 10); // Fetch first page, limit 10
    }
};

// Handle clicking a notification: mark as read and navigate to URL if present
const handleNotificationClick = async (noti: INotification) => {
    if (!noti.is_read) {
        await notification.markNotificationAsRead(noti._id!);
    }
    if (noti.url) {
        router.push(noti.url); // Navigate to the URL
    }
};

// Initial setup: count unread notifications and start polling
onMounted(() => {
    if (isAuthenticated.value) {
        notification.countUnread();
        notification.fetchNotifications(1, 10);
        notification.startPolling(); // Start polling every 30 seconds
    }
});
</script>

<style scoped>
/* Optional: Fine-tune scrollbar for dropdown */
.max-h-96::-webkit-scrollbar {
    width: 6px;
}

.max-h-96::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
}

.max-h-96::-webkit-scrollbar-track {
    background: transparent;
}
</style>
