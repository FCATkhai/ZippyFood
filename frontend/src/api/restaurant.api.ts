// restaurant.api.ts
import axios from "@/utils/axios";
import type { IRestaurant } from "~/shared/interface";

const API_URL = "/restaurants";

// Interface for API responses
interface IApiResponse<T> {
    success: boolean;
    message?: string;
    restaurant?: T;
    data?: T[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasMore?: boolean;
}

// Interface for query parameters for getRestaurants
interface IRestaurantListParams {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: string;
    min_rating?: number;
    sort_by?: "createdAt" | "rating";
    sort?: "asc" | "desc";
    check_open?: string;
}

// Interface for create restaurant data
interface ICreateRestaurantData {
    owner_id: string;
    name: string;
    address: string;
    file?: File; // For thumbnail upload
}

// Interface for update restaurant data
interface IUpdateRestaurantData {
    name?: string;
    phone?: string;
    location?: any;
    open_hours?: any[];
    is_active?: boolean;
    file?: File; // For thumbnail update
}

/**
 * Tạo nhà hàng mới
 * @param data Restaurant creation data including thumbnail file
 * @returns Created restaurant
 */
export const createRestaurant = async (data: ICreateRestaurantData) => {
    const formData = new FormData();
    formData.append("owner_id", data.owner_id);
    formData.append("name", data.name);
    formData.append("address", data.address);
    if (data.file) {
        formData.append("file", data.file);
    }

    const res = await axios.post<IApiResponse<IRestaurant>>(API_URL, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};

/**
 * Lấy danh sách nhà hàng
 * @param params Query parameters for filtering and sorting
 * @returns List of restaurants with pagination info
 */
export const getRestaurants = async (params: IRestaurantListParams = {}) => {
    const res = await axios.get<IApiResponse<IRestaurant>>(API_URL, { params });
    return res.data;
};

/**
 * Lấy thông tin chi tiết nhà hàng
 * @param id Restaurant ID
 * @returns Restaurant details
 */
export const getRestaurantById = async (id: string) => {
    const res = await axios.get<IApiResponse<IRestaurant>>(`${API_URL}/${id}`);
    return res.data;
};

/**
 * Lấy thông tin chi tiết nhà hàng
 * @param id Restaurant ID
 * @returns Restaurant details
 */
export const getRestaurant = async (params: {owner_id: string}) => {
    const res = await axios.get<IApiResponse<IRestaurant>>(`${API_URL}/get-one`, {params});
    return res.data;
};

/**
 * Cập nhật thông tin nhà hàng
 * @param id Restaurant ID
 * @param data Updated restaurant data
 * @returns Updated restaurant
 */
export const updateRestaurant = async (id: string, data: IUpdateRestaurantData) => {
    const formData = new FormData();

    if (data.name) formData.append("name", data.name);
    if (data.phone) formData.append("phone", data.phone);
    if (data.location) formData.append("location", JSON.stringify(data.location));
    if (data.open_hours) formData.append("open_hours", JSON.stringify(data.open_hours));
    if (data.file) formData.append("file", data.file);
    if (data.is_active !== undefined) formData.append("is_active", data.is_active.toString());

    const res = await axios.patch<IApiResponse<IRestaurant>>(`${API_URL}/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};

/**
 * Xóa nhà hàng
 * @param id Restaurant ID
 * @returns Success message
 */
export const deleteRestaurant = async (id: string) => {
    const res = await axios.delete<IApiResponse<IRestaurant>>(`${API_URL}/${id}`);
    return res.data;
};
