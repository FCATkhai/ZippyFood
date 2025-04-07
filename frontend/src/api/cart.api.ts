// cart.api.ts
import axios from "@/utils/axios";
import type { ICart, ICartItem } from "~/shared/interface";

// Interface for API responses
interface IApiResponse<T> {
    success: boolean;
    message?: string;
    cart?: T;
}

// Interface for cart item data (for add/update)
interface ICartItemData {
    product_id: string;
    quantity: number;
}

const API_URL = "/cart";

/**
 * Get customer's cart
 * @returns Cart object or empty cart
 */
export const getCart = async () => {
    const res = await axios.get<IApiResponse<ICart>>(API_URL);
    return res.data;
};

/**
 * Add product to cart
 * @param data Cart item data
 * @returns Updated cart
 */
export const addToCart = async (data: ICartItemData) => {
    const res = await axios.post<IApiResponse<ICart>>(API_URL, data);
    return res.data;
};

/**
 * Update cart item quantity
 * @param data Cart item data with updated quantity
 * @returns Updated cart
 */
export const updateCartItem = async (data: ICartItemData) => {
    const res = await axios.patch<IApiResponse<ICart>>(API_URL, data);
    return res.data;
};

/**
 * Remove product from cart
 * @param productId Product ID to remove
 * @returns Updated cart
 */
export const removeFromCart = async (productId: string) => {
    const res = await axios.delete<IApiResponse<ICart>>(`${API_URL}/${productId}`);
    return res.data;
};

/**
 * Clear entire cart
 * @returns Success message
 */
export const clearCart = async () => {
    const res = await axios.delete<IApiResponse<ICart>>(API_URL);
    return res.data;
};
