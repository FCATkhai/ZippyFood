// useNotification.ts
import { ref, computed } from "vue";
import {
    getNotifications,
    createNotification,
    markAsRead,
    markAsReadAll,
    deleteNotification,
} from "@/api/notification.api";
import type { INotification } from "~/shared/interface";

interface IApiResponse<T> {
    success: boolean;
    message?: string;
    notification?: T; // Single notification
    notifications?: T[]; // Array of notifications
    modifiedCount?: number;
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasMore?: boolean;
}

export function useNotification() {
    const notifications = ref<INotification[]>([]);
    const notification = ref<INotification | null>(null);
    const total = ref<number>(0);
    const page = ref<number>(1);
    const limit = ref<number>(10);
    const totalPages = ref<number>(0);
    const hasMore = ref<boolean>(false);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    /**
     * Fetch notifications with pagination and optional is_read filter
     */
    async function fetchNotifications(
        p: number = 1,
        l: number = 10,
        isRead?: boolean,
        sort: "asc" | "desc" = "desc"
    ) {
        loading.value = true;
        error.value = null;
        try {
            const response: IApiResponse<INotification> = await getNotifications(p, l, isRead, sort);
            if (response.success) {
                notifications.value = response.notifications || [];
                total.value = response.total || 0;
                page.value = response.page || p;
                limit.value = response.limit || l;
                totalPages.value = response.totalPages || 0;
                hasMore.value = response.hasMore || false;
            } else {
                throw new Error(response.message || "Failed to fetch notifications");
            }
        } catch (err: any) {
            error.value = err.message || "Error fetching notifications";
            notifications.value = [];
        } finally {
            loading.value = false;
        }
    }

    /**
     * Create a new notification
     */
    async function create(data: { user_id: string; title: string; content: string; url?: string }) {
        loading.value = true;
        error.value = null;
        try {
            const response: IApiResponse<INotification> = await createNotification(data);
            if (response.success && response.notification) {
                notification.value = response.notification;
                // Optionally add to the list if on the first page
                if (page.value === 1) {
                    notifications.value.unshift(response.notification);
                    total.value += 1;
                }
            } else {
                throw new Error(response.message || "Failed to create notification");
            }
        } catch (err: any) {
            error.value = err.message || "Error creating notification";
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Mark a notification as read
     */
    async function markNotificationAsRead(id: string) {
        loading.value = true;
        error.value = null;
        try {
            const response: IApiResponse<INotification> = await markAsRead(id);
            if (response.success) {
                const index = notifications.value.findIndex((n) => n._id === id);
                if (index !== -1) {
                    notifications.value[index].is_read = true;
                }
                if (notification.value?._id === id) {
                    notification.value.is_read = true;
                }
            } else {
                throw new Error(response.message || "Failed to mark notification as read");
            }
        } catch (err: any) {
            error.value = err.message || "Error marking notification as read";
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Mark all notifications as read
     */
    async function markAllAsRead() {
        loading.value = true;
        error.value = null;
        try {
            const response: IApiResponse<INotification> = await markAsReadAll();
            if (response.success) {
                // Update all notifications in the current list to is_read: true
                notifications.value = notifications.value.map((n) => ({
                    ...n,
                    is_read: true,
                }));
                if (notification.value && !notification.value.is_read) {
                    notification.value.is_read = true;
                }
            } else {
                throw new Error(response.message || "Failed to mark all notifications as read");
            }
        } catch (err: any) {
            error.value = err.message || "Error marking all notifications as read";
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Delete a notification
     */
    async function deleteNotificationById(id: string) {
        loading.value = true;
        error.value = null;
        try {
            const response: IApiResponse<INotification> = await deleteNotification(id);
            if (response.success) {
                notifications.value = notifications.value.filter((n) => n._id !== id);
                total.value -= 1;
                if (notification.value?._id === id) {
                    notification.value = null;
                }
            } else {
                throw new Error(response.message || "Failed to delete notification");
            }
        } catch (err: any) {
            error.value = err.message || "Error deleting notification";
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Reset all reactive state
     */
    function reset() {
        notifications.value = [];
        notification.value = null;
        total.value = 0;
        page.value = 1;
        limit.value = 10;
        totalPages.value = 0;
        hasMore.value = false;
        loading.value = false;
        error.value = null;
    }

    return {
        notifications: computed(() => notifications.value),
        notification: computed(() => notification.value),
        total: computed(() => total.value),
        page: computed(() => page.value),
        limit: computed(() => limit.value),
        totalPages: computed(() => totalPages.value),
        hasMore: computed(() => hasMore.value),
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        fetchNotifications,
        create,
        markNotificationAsRead,
        markAllAsRead,
        deleteNotificationById,
        reset,
    };
}
