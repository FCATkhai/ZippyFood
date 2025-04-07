// Store for merchant to manage restaurant after login

import { defineStore } from "pinia";
import { getRestaurant } from "@/api/restaurant.api";
import type { IRestaurant } from "~/shared/interface";

interface RestaurantState {
    restaurant: IRestaurant | null;
    loading: boolean;
    error: string | null;
}

export const useRestaurantStore = defineStore("restaurant", {
    state: (): RestaurantState => ({
        restaurant: null, // get id from _id
        loading: false,
        error: null,
    }),

    actions: {
        async fetchRestaurant(owner_id: string) {
            this.loading = true;
            this.error = null;

            try {
                const response = await getRestaurant({ owner_id });
                this.restaurant = response.restaurant || null;
            } catch (error: any) {
                this.error = error.data?.message || "get restaurant failed";
                if (error.status == 404) {
                    throw Error("Không tìm thấy nhà hàng");
                }
            } finally {
                this.loading = false;
            }
        },
        reset() {
            this.restaurant = null;
        }

    },
    persist: true
});
