// user.api.ts
import axios from "@/utils/axios";
import type { IUser } from "~/shared/interface";

const API_URL = "/users";

// Interface definitions for responses
interface IApiResponse<T> {
    success: boolean;
    message?: string;
    user?: T;
    data?: T;
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasMore?: boolean;
}

interface IUsersListParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: "customer" | "restaurant_owner" | "admin" | "";
    sort?: "asc" | "desc";
}

/**
 * Đăng ký tài khoản
 * @param userData User registration data
 * @returns Created user information
 */
export const createUser = async (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
}) => {
    const res = await axios.post<IApiResponse<IUser>>(`${API_URL}/register`, userData);
    return res.data;
};

/**
 * Thay đổi vai trò user
 * @returns Updated user information
 */
export const changeUserRole = async (id: string, role: string) => {
    const res = await axios.post<IApiResponse<IUser>>(`${API_URL}/change-role`, { id, role });
    return res.data;
};

/**
 * Lấy danh sách tất cả user
 * @param params Query parameters for filtering and sorting
 * @returns List of users with pagination info
 */
export const getUsers = async (params: IUsersListParams = {}) => {
    const res = await axios.get<IApiResponse<IUser[]>>(API_URL, { params });
    return res.data;
};

/**
 * Lấy thông tin user theo ID
 * @param id User ID
 * @returns User information
 */
export const getUserById = async (id: string) => {
    const res = await axios.get<IApiResponse<IUser>>(`${API_URL}/${id}`);
    return res.data;
};

/**
 * Cập nhật thông tin user
 * @param id User ID
 * @param userData Updated user data
 * @returns Updated user information
 */
export const updateUser = async (
    id: string,
    userData: {
        name?: string;
        email?: string;
        phone?: string;
    }
) => {
    const res = await axios.put<IApiResponse<IUser>>(`${API_URL}/${id}`, userData);
    return res.data;
};

/**
 * Thay đổi mật khẩu
 * @param id User ID
 * @param passwordData Old and new password
 * @returns Success message
 */
export const changePassword = async (
    id: string,
    passwordData: {
        oldPassword: string;
        newPassword: string;
    }
) => {
    const res = await axios.patch<IApiResponse<never>>(
        `${API_URL}/${id}/change-password`,
        passwordData
    );
    return res.data;
};

/**
 * Xóa user
 * @param id User ID
 * @returns Success message
 */
export const deleteUser = async (id: string) => {
    const res = await axios.delete<IApiResponse<never>>(`${API_URL}/${id}`);
    return res.data;
};
