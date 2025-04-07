import { ref } from "vue";
import {
    createCategory,
    getCategoriesByRestaurant,
    updateCategory,
    deleteCategory,
} from "@/api/category.api";
import type { ICategory } from "~/shared/interface";

export function useCategory() {
    const categories = ref<ICategory[]>([]);
    const category = ref<ICategory | null>(null);
    const loading = ref(false);

    // Fetch categories for a restaurant
    const fetchCategories = async (restaurantId: string) => {
        if (loading.value) return;

        loading.value = true;
        try {
            const response = await getCategoriesByRestaurant(restaurantId);
            categories.value = response.categories || [];
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            loading.value = false;
        }
    };

    // Create a new category
    const addCategory = async (data: {
        restaurant_id: string;
        name: string;
        description?: string;
    }) => {
        loading.value = true;
        try {
            const response = await createCategory(data);
            category.value = response.category || null;
            if (response.category) {
                categories.value.push(response.category);
            }
            return response.category;
        } catch (error) {
            console.error("Error creating category:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Update a category
    const editCategory = async (id: string, data: Partial<{
        restaurant_id: string;
        name: string;
        description?: string;
    }>) => {
        loading.value = true;
        try {
            const response = await updateCategory(id, data);
            category.value = response.category || null;
            if (response.category) {
                const index = categories.value.findIndex(cat => cat._id === id);
                if (index !== -1) {
                    categories.value[index] = response.category;
                }
            }
            return response.category;
        } catch (error) {
            console.error("Error updating category:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Delete a category
    const removeCategory = async (id: string) => {
        loading.value = true;
        try {
            await deleteCategory(id);
            categories.value = categories.value.filter(cat => cat._id !== id);
        } catch (error) {
            console.error("Error deleting category:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    return {
        categories,
        category,
        loading,
        fetchCategories,
        addCategory,
        editCategory,
        removeCategory,
    };
}
