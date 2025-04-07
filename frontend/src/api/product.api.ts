import axios from "@/utils/axios";
import type { IProduct } from "~/shared/interface";

// Interface for API responses
interface IApiResponse<T> {
    success: boolean;
    message?: string;
    product?: T;
    products?: T[];
    groupedProducts?: Record<string, T[]>;
}

// Interface for create/update product data
interface IProductData {
    restaurant_id: string;
    name: string;
    description?: string;
    tags?: string[];
    price: number;
    discount?: number;
    category_id: string;
    image?: File;
    status?: "available" | "unavailable";
}

const API_URL = "/products";

/**
 * Tạo món ăn mới
 * @param data Product data including image file
 * @returns Created product
 */
export const createProduct = async (data: IProductData) => {
    const formData = new FormData();
    formData.append("restaurant_id", data.restaurant_id);
    formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    formData.append("tags", JSON.stringify(data.tags || []));
    formData.append("price", data.price.toString());
    if (data.discount) formData.append("discount", data.discount.toString());
    formData.append("category_id", data.category_id);
    if (data.image) formData.append("file", data.image);

    const res = await axios.post<IApiResponse<IProduct>>(API_URL, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};

/**
 * Lấy danh sách món ăn của một nhà hàng
 * @param restaurantId Restaurant ID
 * @returns List of products
 */
export const getProductsByRestaurant = async (restaurantId: string) => {
    const res = await axios.get<IApiResponse<IProduct>>(`${API_URL}/${restaurantId}`);
    return res.data;
};

/**
 * Lấy toàn bộ món ăn được phân theo nhóm của một nhà hàng
 * @param restaurantId Restaurant ID
 * @returns Products grouped by category
 */
export const getProductsGroupedByCategory = async (restaurantId: string) => {
    const res = await axios.get<IApiResponse<IProduct>>(`${API_URL}/grouped/${restaurantId}`);
    return res.data;
};

/**
 * Cập nhật món ăn
 * @param id Product ID
 * @param data Updated product data
 * @returns Updated product
 */
export const updateProduct = async (id: string, data: Partial<IProductData>) => {
    console.log("updateProduct", data);
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (data.tags) formData.append("tags", JSON.stringify(data.tags));
    if (data.price) formData.append("price", data.price.toString());
    if (data.discount) formData.append("discount", data.discount.toString());
    if (data.category_id) formData.append("category_id", data.category_id);
    if (data.image) formData.append("file", data.image);
    if (data.status) formData.append("status", data.status);

    const res = await axios.patch<IApiResponse<IProduct>>(`${API_URL}/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};

/**
 * Xóa món ăn
 * @param id Product ID
 * @returns Success message
 */
export const deleteProduct = async (id: string) => {
    const res = await axios.delete<IApiResponse<IProduct>>(`${API_URL}/${id}`);
    return res.data;
};
