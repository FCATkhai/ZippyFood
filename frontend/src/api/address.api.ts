import axios from "@/utils/axios";
import type { IUser } from "~/shared/interface";

interface IApiResponse<T> {
    success: boolean;
    message?: string;
    user?: T;
    addresses?: string[];
}

interface IAddressData {
    address: string;
}

const API_URL = "/users";

/**
 * Add a new address for a user
 * @param userId User ID
 * @param address New address
 * @returns Updated user or addresses
 */
export const addAddress = async (userId: string, address: string): Promise<IApiResponse<IUser>> => {
    const res = await axios.post<IApiResponse<IUser>>(`${API_URL}/${userId}/addresses`, { address });
    return res.data;
};

/**
 * Update an existing address for a user
 * @param userId User ID
 * @param index Address index
 * @param address Updated address
 * @returns Updated user or addresses
 */
export const updateAddress = async (
    userId: string,
    index: number,
    address: string
): Promise<IApiResponse<IUser>> => {
    const res = await axios.put<IApiResponse<IUser>>(`${API_URL}/${userId}/addresses/${index}`, { address });
    return res.data;
};

/**
 * Delete an address for a user
 * @param userId User ID
 * @param index Address index
 * @returns Updated user or addresses
 */
export const deleteAddress = async (userId: string, index: number): Promise<IApiResponse<IUser>> => {
    const res = await axios.delete<IApiResponse<IUser>>(`${API_URL}/${userId}/addresses/${index}`);
    return res.data;
};
