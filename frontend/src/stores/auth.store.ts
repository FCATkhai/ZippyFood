import { defineStore } from "pinia";
import { login, logout } from "@/api/auth.api";
import type {IUser} from "~/shared/interface";

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
            } catch (error: any) {
                this.error = error.data?.message || "Logout failed";
            } finally {
                this.loading = false;
            }
        },
    },
    persist: true
});
