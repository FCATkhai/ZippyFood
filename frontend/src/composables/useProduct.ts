import { ref } from "vue";
import {
    createProduct,
    getProductsByRestaurant,
    getProductsGroupedByCategory,
    updateProduct,
    deleteProduct,
} from "@/api/product.api";
import type { IProduct, ICategory } from "~/shared/interface";

export function useProduct() {
    const products = ref<IProduct[]>([]);
    const product = ref<IProduct | null>(null);
    const groupedProducts = ref<Record<string, IProduct[]>>({});
    const loading = ref(false);

    // Fetch products for a restaurant
    const fetchProducts = async (restaurantId: string) => {
        if (loading.value) return;

        loading.value = true;
        try {
            const response = await getProductsByRestaurant(restaurantId);
            products.value = response.products || [];
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            loading.value = false;
        }
    };

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

    // Create a new product
    const addProduct = async (data: {
        restaurant_id: string;
        name: string;
        description?: string;
        tags?: string[];
        price: number;
        discount?: number;
        category_id: string;
        image?: File;
    }) => {
        loading.value = true;
        try {
            const response = await createProduct(data);
            product.value = response.product || null;
            if (response.product) {
                products.value.push(response.product);
            }
            return response.product;
        } catch (error) {
            console.error("Error creating product:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Update a product
    const editProduct = async (id: string, data: Partial<{
        name: string;
        description?: string;
        tags?: string[];
        price: number;
        discount?: number;
        category_id: string;
        image?: File;
        status?: "available" | "unavailable";
    }>) => {
        loading.value = true;
        try {
            const response = await updateProduct(id, data);
            product.value = response.product || null;
            if (response.product) {
                const index = products.value.findIndex(prod => prod._id === id);
                if (index !== -1) {
                    products.value[index] = response.product;
                }
            }
            return response.product;
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Delete a product
    const removeProduct = async (id: string) => {
        loading.value = true;
        try {
            await deleteProduct(id);
            products.value = products.value.filter(prod => prod._id !== id);
        } catch (error) {
            console.error("Error deleting product:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Get product by ID from local state
    const getProductById = (id: string): IProduct | undefined => {
        return products.value.find(prod => prod._id === id);
    };

    // Update product status
    const updateProductStatus = async (id: string, status: "available" | "unavailable") => {
        return await editProduct(id, { status });
    };

    return {
        products,
        product,
        groupedProducts,
        loading,
        fetchProducts,
        fetchGroupedProducts,
        addProduct,
        editProduct,
        removeProduct,
        getProductById,
        updateProductStatus,
    };
}
