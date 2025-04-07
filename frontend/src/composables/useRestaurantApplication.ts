// useRestaurantApplication.ts
import { ref, watch } from "vue";
import {
    applyForRestaurant,
    getAllApplications,
    updateApplicationStatus,
    deleteApplication,
} from "@/api/restaurantApplication.api";
import type { IRestaurantApplication } from "~/shared/interface";

export function useRestaurantApplication() {
    const applications = ref<IRestaurantApplication[]>([]);
    const application = ref<IRestaurantApplication | null>(null);
    const page = ref(1);
    const limit = ref(10);
    const totalPages = ref(1);
    const hasMore = ref(true);
    const loading = ref(false);
    const searchTerm = ref("");
    const statusFilter = ref<"pending" | "approved" | "rejected" | "">("");
    const sortOrder = ref<"asc" | "desc">("desc");

    let searchTimeout: ReturnType<typeof setTimeout> | null = null;

    const fetchApplications = async (reset = false) => {
        if (loading.value) return;

        if (reset) {
            page.value = 1;
            hasMore.value = true;
        }

        loading.value = true;
        try {
            const response = await getAllApplications({
                page: page.value,
                limit: limit.value,
                search: searchTerm.value,
                status: statusFilter.value,
                sort: sortOrder.value,
            });
            applications.value = response.allApplications || [];
            totalPages.value = response.totalPages || 1;
            hasMore.value = response.hasMore || false;
        } catch (error) {
            console.error("Lỗi tải danh sách đơn đăng ký:", error);
        } finally {
            loading.value = false;
        }
    };

    // Submit a new restaurant application
    const submitApplication = async (data: {
        restaurant_name: string;
        owner_name: string;
        phone: string;
        address: string;
        identify_document: File;
        business_license: File;
        food_safety_certificate: File;
    }) => {
        loading.value = true;
        try {
            const response = await applyForRestaurant(data);
            application.value = response.application || null;
            return response.application;
        } catch (error) {
            console.error("Lỗi khi gửi đơn đăng ký:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Update application status
    const updateStatus = async (id: string, status: "pending" | "approved" | "rejected") => {
        loading.value = true;
        try {
            const response = await updateApplicationStatus(id, status);
            application.value = response.application || null;
            return response.application;
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái đơn:", error);
            throw error;
        } finally {
            loading.value = false;
            await fetchApplications(); // Refresh list after update
        }
    };

    // Delete application
    const removeApplication = async (id: string) => {
        loading.value = true;
        try {
            await deleteApplication(id);
        } catch (error) {
            console.error("Lỗi khi xóa đơn đăng ký:", error);
            throw error;
        } finally {
            loading.value = false;
            await fetchApplications(); // Refresh list after deletion
        }
    };

    // Watch for filter changes with debounce
    watch([searchTerm, statusFilter, sortOrder], () => {
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            fetchApplications(true);
        }, 500);
    });

    // Watch page changes
    watch(page, () => {
        fetchApplications();
    });

    return {
        applications,
        application,
        page,
        limit,
        totalPages,
        hasMore,
        loading,
        searchTerm,
        statusFilter,
        sortOrder,
        fetchApplications,
        submitApplication,
        updateStatus,
        removeApplication,
    };
}
