// category.api.ts
import axios from "@/utils/axios";
import type { ICategory } from "~/shared/interface";

// Interface for API responses
interface IApiResponse<T> {
    success: boolean;
    message?: string;
    category?: T;
    categories?: T[];
}

// Interface for create/update category data
interface ICategoryData {
    restaurant_id: string;
    name: string;
    description?: string;
}

const API_URL = "/categories";

/**
 * Tạo danh mục món ăn
 * @param data Category data
 * @returns Created category
 */
export const createCategory = async (data: ICategoryData) => {
    const res = await axios.post<IApiResponse<ICategory>>(API_URL, data);
    return res.data;
};

/**
 * Lấy danh sách danh mục của một nhà hàng
 * @param restaurantId Restaurant ID
 * @returns List of categories
 */
export const getCategoriesByRestaurant = async (restaurantId: string) => {
    const res = await axios.get<IApiResponse<ICategory>>(`${API_URL}/${restaurantId}`);
    return res.data;
};

/**
 * Cập nhật danh mục món ăn
 * @param id Category ID
 * @param data Updated category data
 * @returns Updated category
 */
export const updateCategory = async (id: string, data: Partial<ICategoryData>) => {
    const res = await axios.put<IApiResponse<ICategory>>(`${API_URL}/${id}`, data);
    return res.data;
};

/**
 * Xoá danh mục món ăn
 * @param id Category ID
 * @returns Success message
 */
export const deleteCategory = async (id: string) => {
    const res = await axios.delete<IApiResponse<ICategory>>(`${API_URL}/${id}`);
    return res.data;
};
