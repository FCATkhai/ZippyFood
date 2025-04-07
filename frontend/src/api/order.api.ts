import axios from "@/utils/axios";
import type { IOrder } from "~/shared/interface";

// Interface for API responses
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

// Interface for creating an order
interface IOrderCreateData {
    address: string;
    note?: string;
}

const API_URL = "/orders";

/**
 * Create an order from the cart
 * @param data Order creation data
 * @returns Created order
 */
export const createOrder = async (data: IOrderCreateData): Promise<IApiResponse<IOrder>> => {
    const res = await axios.post<IApiResponse<IOrder>>(API_URL, data);
    return res.data;
};

/**
 * Get orders by customer ID with pagination and status filter
 * @param customerId Customer ID
 * @param page Page number
 * @param limit Items per page
 * @param status Optional status filter
 * @returns Paginated list of orders
 */
export const getOrdersByUser = async (
    customerId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
): Promise<IApiResponse<IOrder>> => {
    const res = await axios.get<IApiResponse<IOrder>>(`${API_URL}/customer/${customerId}`, {
        params: { page, limit, status }
    });
    return res.data;
};

/**
 * Get orders by restaurant ID with pagination and status filter
 * @param restaurantId Restaurant ID
 * @param page Page number
 * @param limit Items per page
 * @param status Optional status filter
 * @returns Paginated list of orders
 */
export const getOrdersByRestaurant = async (
    restaurantId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
): Promise<IApiResponse<IOrder>> => {
    const res = await axios.get<IApiResponse<IOrder>>(`${API_URL}/restaurant/${restaurantId}`, {
        params: { page, limit, status }
    });
    return res.data;
};

/**
 * Get all orders with pagination, status filter, and search
 * @param page Page number
 * @param limit Items per page
 * @param status Optional status filter
 * @param search Optional search by restaurant name or user phone
 * @returns Paginated list of orders
 */
export const getOrders = async (
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string
): Promise<IApiResponse<IOrder>> => {
    const res = await axios.get<IApiResponse<IOrder>>(API_URL, {
        params: { page, limit, status, search }
    });
    return res.data;
};

/**
 * Update order status
 * @param orderId Order ID
 * @param status New status
 * @returns Updated order
 */
export const updateOrderStatus = async (
    orderId: string,
    status: "pending" | "processing" | "ordering" | "completed" | "cancelled"
): Promise<IApiResponse<IOrder>> => {
    const res = await axios.patch<IApiResponse<IOrder>>(`${API_URL}/${orderId}`, { status });
    return res.data;
};
