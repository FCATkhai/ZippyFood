// useRestaurant.ts
import { ref, watch } from "vue";
import {
    createRestaurant,
    getRestaurants,
    getRestaurantById,
    getRestaurant,
    updateRestaurant,
    deleteRestaurant,
} from "@/api/restaurant.api";
import type { IRestaurant } from "~/shared/interface";

export function useRestaurant() {
    const restaurants = ref<IRestaurant[]>([]);
    const restaurant = ref<IRestaurant | null>(null);
    const page = ref(1);
    const limit = ref(10);
    const totalPages = ref(1);
    const hasMore = ref(true);
    const loading = ref(false);
    const searchTerm = ref("");
    const isActiveFilter = ref<string>("");
    const minRatingFilter = ref<number>(0);
    const sortBy = ref<"createdAt" | "rating">("createdAt");
    const sortOrder = ref<"asc" | "desc">("desc");

    let searchTimeout: ReturnType<typeof setTimeout> | null = null;

    // Fetch restaurant list
    const fetchRestaurants = async (reset = false) => {
        if (loading.value) return;

        if (reset) {
            page.value = 1;
            hasMore.value = true;
        }

        loading.value = true;
        try {
            const response = await getRestaurants({
                page: page.value,
                limit: limit.value,
                search: searchTerm.value,
                is_active: isActiveFilter.value,
                min_rating: minRatingFilter.value,
                sort_by: sortBy.value,
                sort: sortOrder.value,
            });
            restaurants.value = response.data || [];
            totalPages.value = response.totalPages || 1;
            hasMore.value = response.hasMore || false;
        } catch (error) {
            console.error("Lỗi tải danh sách nhà hàng:", error);
        } finally {
            loading.value = false;
        }
    };

    // Fetch single restaurant by ID
    const fetchRestaurantById = async (id: string) => {
        loading.value = true;
        try {
            const response = await getRestaurantById(id);
            restaurant.value = response.restaurant || null;
            return response.restaurant;
        } catch (error) {
            console.error("Lỗi tải thông tin nhà hàng:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Create new restaurant
    const createNewRestaurant = async (data: {
        owner_id: string;
        name: string;
        address: string;
        file?: File;
    }) => {
        loading.value = true;
        try {
            const response = await createRestaurant(data);
            restaurant.value = response.restaurant || null;
            await fetchRestaurants(true); // Refresh list
            return response.restaurant;
        } catch (error) {
            console.error("Lỗi khi tạo nhà hàng:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Update restaurant
    const updateExistingRestaurant = async (
        id: string,
        data: {
            name?: string;
            phone?: string;
            location?: any;
            open_hours?: any[];
            file?: File;
            is_active?: boolean;
        }
    ) => {
        loading.value = true;
        try {
            const response = await updateRestaurant(id, data);
            restaurant.value = response.restaurant || null;
            await fetchRestaurants(); // Refresh list
            return response.restaurant;
        } catch (error) {
            console.error("Lỗi khi cập nhật nhà hàng:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Delete restaurant
    const removeRestaurant = async (id: string) => {
        loading.value = true;
        try {
            await deleteRestaurant(id);
            await fetchRestaurants(); // Refresh list
        } catch (error) {
            console.error("Lỗi khi xóa nhà hàng:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Watch for filter changes with debounce
    watch([searchTerm, isActiveFilter, minRatingFilter, sortBy, sortOrder], () => {
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            fetchRestaurants(true);
        }, 500);
    });

    // Watch page changes
    watch(page, () => {
        fetchRestaurants();
    });

    return {
        restaurants,
        restaurant,
        page,
        limit,
        totalPages,
        hasMore,
        loading,
        searchTerm,
        isActiveFilter,
        minRatingFilter,
        sortBy,
        sortOrder,
        fetchRestaurants,
        fetchRestaurantById,
        createNewRestaurant,
        updateExistingRestaurant,
        removeRestaurant,
    };
}

