import { defineStore } from "pinia";
import {
    getCart,
    addToCart as addToCart_API,
    updateCartItem as updateCartItem_API,
    removeFromCart as removeFromCart_API,
    clearCart as clearCart_API
} from "@/api/cart.api";
import type { ICart, ICartItem } from "~/shared/interface";

interface CartState {
    cart: ICart | null;
    loading: boolean;
    error: string | null;
}

export const useCartStore = defineStore("cart", {
    state: (): CartState => ({
        cart: null,
        loading: false,
        error: null,
    }),

    getters: {
        // Total number of items in cart
        totalItems: (state): number => {
            return state.cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
        },
        // Total price of items in cart
        totalPrice: (state): number => {
            return state.cart?.items.reduce((sum, item) => sum + item.final_price * item.quantity, 0) || 0;
        },
        // Check if cart is empty
        isEmpty: (state): boolean => {
            return !state.cart || state.cart.items.length === 0;
        }
    },

    actions: {
        // Fetch cart from server
        async fetchCart() {
            this.loading = true;
            this.error = null;
            try {
                const response = await getCart();
                this.cart = response.cart || null;
            } catch (error: any) {
                this.error = error.message || "Failed to fetch cart";
                this.cart = null; // Fallback to empty cart
            } finally {
                this.loading = false;
            }
        },

        // Add product to cart
        async addToCart(product_id: string, quantity: number) {
            this.loading = true;
            this.error = null;
            try {
                const response = await addToCart_API({ product_id, quantity });
                this.cart = response.cart || null;
            } catch (error: any) {
                this.error = error.message || "Failed to add to cart";
                throw error; // Re-throw to handle in component if needed
            } finally {
                this.loading = false;
            }
        },

        // Update cart item quantity
        async updateCartItem(product_id: string, quantity: number) {
            this.loading = true;
            this.error = null;
            try {
                const response = await updateCartItem_API({ product_id, quantity });
                this.cart = response.cart || null;
            } catch (error: any) {
                this.error = error.message || "Failed to update cart item";
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Remove product from cart
        async removeFromCart(product_id: string) {
            this.loading = true;
            this.error = null;
            try {
                const response = await removeFromCart_API(product_id);
                this.cart = response.cart || null;
            } catch (error: any) {
                this.error = error.message || "Failed to remove from cart";
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Clear entire cart
        async clearCart() {
            this.loading = true;
            this.error = null;
            try {
                await clearCart_API();
                this.cart = null;
            } catch (error: any) {
                this.error = error.message || "Failed to clear cart";
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Optional: Reset store state (e.g., on logout)
        reset() {
            this.cart = null;
            this.loading = false;
            this.error = null;
        }
    },

    persist: true
});
