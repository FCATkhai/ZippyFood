import axios from "@/utils/axios";
import type { IUser, IErrorResponse } from "~/shared/interface";

const API_URL = "/users";
interface ILoginResponse {
    success: boolean,
    message: string,
    user: IUser
}

/**
 * Đăng nhập
 * @param email
 * @param password
 * @returns Thông báo và user nếu có
 */
export const login = async (email: string, password: string) => {
    const res = await axios.post<ILoginResponse>(`${API_URL}/login`, {email, password });
    return res.data;
};

/**
 * Đăng xuất
 * @returns Thông báo
 */
export const logout = async () => {
    await axios.post<IErrorResponse>(`${API_URL}/logout`);
};


