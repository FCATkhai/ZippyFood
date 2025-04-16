import { ref, computed } from "vue";
import {
    createOrder,
    getOrdersByUser,
    getOrdersByRestaurant,
    getOrders,
    getOrderById,
    updateOrderStatus,
} from "@/api/order.api";
import type { IOrder } from "~/shared/interface";

interface IApiResponse<T> {
    success: boolean;
    message?: string;
    order?: T; // Single order
    orders?: T[]; // Array of orders
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasMore?: boolean;
}

export function useOrder() {
    const orders = ref<IOrder[]>([]);
    const order = ref<IOrder | null>(null);
    const total = ref<number>(0);
    const page = ref<number>(1);
    const limit = ref<number>(10);
    const totalPages = ref<number>(0);
    const hasMore = ref<boolean>(false);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    async function create(address: string, note?: string) {
        loading.value = true;
        error.value = null;
        try {
            const response: IApiResponse<IOrder> = await createOrder({ address, note });
            if (response.success && response.order) {
                order.value = response.order;
            } else {
                throw new Error(response.message || "Failed to create order");
            }
        } catch (err: any) {
            error.value = err.message || "Error creating order";
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function fetchOrdersByUser(customerId: string, p: number = 1, l: number = 10, status?: string) {
        loading.value = true;
        error.value = null;
        try {
            const response: IApiResponse<IOrder> = await getOrdersByUser(customerId, p, l, status);
            if (response.success) {
                orders.value = response.orders || [];
                total.value = response.total || 0;
                page.value = response.page || p;
                limit.value = response.limit || l;
                totalPages.value = response.totalPages || 0;
                hasMore.value = response.hasMore || false;
            } else {
                throw new Error(response.message || "Failed to fetch user orders");
            }
        } catch (err: any) {
            error.value = err.message || "Error fetching user orders";
            orders.value = [];
        } finally {
            loading.value = false;
        }
    }

    async function fetchOrdersByRestaurant(restaurantId: string, p: number = 1, l: number = 10, status?: string) {
        loading.value = true;
        error.value = null;
        try {
            const response: IApiResponse<IOrder> = await getOrdersByRestaurant(restaurantId, p, l, status);
            if (response.success) {
                orders.value = response.orders || [];
                total.value = response.total || 0;
                page.value = response.page || p;
                limit.value = response.limit || l;
                totalPages.value = response.totalPages || 0;
                hasMore.value = response.hasMore || false;
            } else {
                throw new Error(response.message || "Failed to fetch restaurant orders");
            }
        } catch (err: any) {
            error.value = err.message || "Error fetching restaurant orders";
            orders.value = [];
        } finally {
            loading.value = false;
        }
    }

    async function fetchOrders(p: number = 1, l: number = 10, status?: string, search?: string) {
        loading.value = true;
        error.value = null;
        try {
            const response: IApiResponse<IOrder> = await getOrders(p, l, status, search);
            if (response.success) {
                orders.value = response.orders || [];
                total.value = response.total || 0;
                page.value = response.page || p;
                limit.value = response.limit || l;
                totalPages.value = response.totalPages || 0;
                hasMore.value = response.hasMore || false;
            } else {
                throw new Error(response.message || "Failed to fetch orders");
            }
        } catch (err: any) {
            error.value = err.message || "Error fetching orders";
            orders.value = [];
        } finally {
            loading.value = false;
        }
    }

    async function fetchOrderById(id: string) {
        loading.value = true;
        error.value = null;
        try {
            const response: IApiResponse<IOrder> = await getOrderById(id);
            if (response.success) {
                order.value = response.order || null;
                return response.order;
            } else {
                throw new Error(response.message || "Failed to fetch order by id");
            }
        } catch (err: any) {
            error.value = err.message || "Error fetching order by id";
            order.value = null;
        } finally {
            loading.value = false;
        }
    }

    async function updateStatus(
        orderId: string,
        status: "pending" | "processing" | "ordering" | "completed" | "cancelled"
    ) {
        loading.value = true;
        error.value = null;
        try {
            const response: IApiResponse<IOrder> = await updateOrderStatus(orderId, status);
            if (response.success && response.order) {
                order.value = response.order;
                const index = orders.value.findIndex(o => o._id.toString() === orderId);
                if (index !== -1) {
                    orders.value[index] = response.order;
                }
            } else {
                throw new Error(response.message || "Failed to update order status");
            }
        } catch (err: any) {
            error.value = err.message || "Error updating order status";
            throw err;
        } finally {
            loading.value = false;
        }
    }

    function reset() {
        orders.value = [];
        order.value = null;
        total.value = 0;
        page.value = 1;
        limit.value = 10;
        totalPages.value = 0;
        hasMore.value = false;
        loading.value = false;
        error.value = null;
    }

    return {
        orders: computed(() => orders.value),
        order: computed(() => order.value),
        total: computed(() => total.value),
        page: computed(() => page.value),
        limit: computed(() => limit.value),
        totalPages: computed(() => totalPages.value),
        hasMore: computed(() => hasMore.value),
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        create,
        fetchOrdersByUser,
        fetchOrdersByRestaurant,
        fetchOrders,
        fetchOrderById,
        updateStatus,
        reset,
    };
}
