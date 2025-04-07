import { defineStore } from "pinia";
import { login, logout } from "@/api/auth.api";
import type {IUser} from "~/shared/interface";
import { useCartStore } from "./cart.store";
import { useRestaurantStore } from "./restaurantStore";
import { USER_ROLES } from "~/shared/userRoles";

interface AuthState {
    user: IUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}



export const useAuthStore = defineStore("auth", {
    state: (): AuthState => ({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
    }),

    actions: {
        async login(email: string, password: string) {
            this.loading = true;
            this.error = null;

            try {
                const response = await login(email, password);
                this.user = response.user;
                this.isAuthenticated = true;


                if (this.user.role === USER_ROLES.RESTAURANT_OWNER) {
                    const restaurantStore = useRestaurantStore();
                    await restaurantStore.fetchRestaurant(this.user._id);
                }
                const cartStore = useCartStore();
                await cartStore.fetchCart();

            } catch (error: any) {
                this.error = error.data?.message || "Login failed";
                if (error.status == 401) {
                    throw Error("Sai email hoặc mật khẩu");
                }
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            this.loading = true;
            try {
                await logout();
                this.user = null;
                this.isAuthenticated = false;

                const restaurantStore = useRestaurantStore();
                restaurantStore.reset();
                const cartStore = useCartStore();
                cartStore.reset();
            } catch (error: any) {
                this.error = error.data?.message || "Logout failed";
            } finally {
                this.loading = false;
            }
        },

        addAddress(address: string) {
            if (this.user) {
                this.user.addresses.push(address);
            }
        },

        updateAddress(index: number, address: string) {
            if (this.user && index >= 0 && index < this.user.addresses.length) {
                this.user.addresses[index] = address;
            }
        },

        removeAddress(index: number) {
            if (this.user && index >= 0 && index < this.user.addresses.length) {
                this.user.addresses.splice(index, 1);
            }
        },
    },
    persist: true
});
