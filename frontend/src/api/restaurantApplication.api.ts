// restaurantApplication.api.ts
import axios from "@/utils/axios";
import type { IRestaurantApplication } from "~/shared/interface";

const API_URL = "/restaurant-applications";

// Interface for API responses
interface IApiResponse<T> {
    success: boolean;
    message?: string;
    application?: T;
    allApplications?: T[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasMore?: boolean;
}

// Interface for query parameters
interface IApplicationsListParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: "pending" | "approved" | "rejected" | "";
    sort?: "asc" | "desc";
}

/**
 * Gửi đơn đăng ký nhà hàng
 * @param data Application data including files
 * @returns Submitted application
 */
export const applyForRestaurant = async (data: {
    restaurant_name: string;
    owner_name: string;
    phone: string;
    address: string;
    identify_document: File;
    business_license: File;
    food_safety_certificate: File;
}) => {
    const formData = new FormData();
    formData.append("restaurant_name", data.restaurant_name);
    formData.append("owner_name", data.owner_name);
    formData.append("phone", data.phone);
    formData.append("address", data.address);
    formData.append("identify_document", data.identify_document);
    formData.append("business_license", data.business_license);
    formData.append("food_safety_certificate", data.food_safety_certificate);

    const res = await axios.post<IApiResponse<IRestaurantApplication>>(API_URL, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};

/**
 * Lấy danh sách đơn đăng ký nhà hàng
 * @param params Query parameters for filtering and sorting
 * @returns List of applications with pagination info
 */
export const getAllApplications = async (params: IApplicationsListParams = {}) => {
    const res = await axios.get<IApiResponse<IRestaurantApplication>>(API_URL, { params });
    return res.data;
};

/**
 * Xét duyệt đơn đăng ký
 * @param id Application ID
 * @param status New status
 * @returns Updated application
 */
export const updateApplicationStatus = async (
    id: string,
    status: "pending" | "approved" | "rejected"
) => {
    const res = await axios.patch<IApiResponse<IRestaurantApplication>>(
        `${API_URL}/${id}`,
        { status }
    );
    return res.data;
};

/**
 * Xóa đơn đăng ký
 * @param id Application ID
 * @returns Success message
 */
export const deleteApplication = async (id: string) => {
    const res = await axios.delete<IApiResponse<IRestaurantApplication>>(`${API_URL}/${id}`);
    return res.data;
};
