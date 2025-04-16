import mongoose from "mongoose";
import Restaurant from "../models/Restaurant.model";
import { IRestaurant } from "~/shared/interface";

/**
 * Restaurant Service
 */
export class RestaurantService {
    /**
     * Get the owner_id of a restaurant by its ID
     * @param restaurantId Restaurant ID
     * @returns Owner ID (ObjectId) or null if not found
     * @throws Error if restaurantId is invalid
     */
    static async getOwnerIdByRestaurantId(restaurantId: string): Promise<mongoose.Types.ObjectId | null> {
        if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
            throw new Error("Invalid restaurant ID");
        }

        const restaurant = await Restaurant.findById(restaurantId).select("owner_id");
        if (!restaurant) {
            return null; // Restaurant not found
        }

        return restaurant.owner_id;
    }

    /**
     * Get restaurant details by ID
     * @param restaurantId Restaurant ID
     * @returns Restaurant document or null if not found
     * @throws Error if restaurantId is invalid
     */
    static async getRestaurantById(restaurantId: string): Promise<IRestaurant | null> {
        if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
            throw new Error("Invalid restaurant ID");
        }

        return await Restaurant.findById(restaurantId);
    }
}