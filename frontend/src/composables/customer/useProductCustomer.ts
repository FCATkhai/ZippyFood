import { ref } from "vue";
import {
    getProductsGroupedByCategory,
} from "@/api/product.api";
import type { IProduct} from "~/shared/interface";

export function useProduct() {
    const product = ref<IProduct | null>(null);
    const groupedProducts = ref<Record<string, IProduct[]>>({});
    const loading = ref(false);

    // Fetch products grouped by category
    const fetchGroupedProducts = async (restaurantId: string) => {
        if (loading.value) return;

        loading.value = true;
        try {
            const response = await getProductsGroupedByCategory(restaurantId);
            groupedProducts.value = response.groupedProducts || {};
        } catch (error) {
            console.error("Error fetching grouped products:", error);
        } finally {
            loading.value = false;
        }
    };


    // Get product by ID from local state
    const getProductById = (id: string): IProduct | undefined => {
        if (!groupedProducts.value) return undefined;
        for (const category in groupedProducts.value) {
            const foundProduct = groupedProducts.value[category].find(
                (product) => product._id === id
            );
            if (foundProduct) {
                return foundProduct;
            }
        }
        return undefined;
    };



    return {
        product,
        groupedProducts,
        loading,
        fetchGroupedProducts,
        getProductById,
    };
}
