// notification.api.ts
import axios from "@/utils/axios";
import type { INotification } from "~/shared/interface";

// Interface for API responses
interface IApiResponse<T> {
    success: boolean;
    message?: string;
    notification?: T; // Single notification
    notifications?: T[]; // Array of notifications
    modifiedCount?: number;
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasMore?: boolean;
    hasUnread?: boolean;
    unreadCount?: number;
}

// Base URL for notification endpoints
const API_URL = "/notifications";


/**
 * Lấy danh sách thông báo của user với phân trang và lọc theo is_read
 * @param page Page number (default: 1)
 * @param limit Number of items per page (default: 10)
 * @param isRead Filter by read status (true, false, or undefined for all)
 * @param sort Sort order ("asc" or "desc", default: "desc")
 * @returns Paginated list of notifications
 */
export const getNotifications = async (
    page: number = 1,
    limit: number = 10,
    isRead?: boolean,
    sort: "asc" | "desc" = "desc"
) => {
    const params: Record<string, string | number> = { page, limit, sort };
    if (isRead !== undefined) {
        params.is_read = isRead.toString(); // Convert boolean to string for query param
    }

    const res = await axios.get<IApiResponse<INotification>>(API_URL, {params});
    return res.data;
};

/**
 * Tạo thông báo mới
 * @param data Notification data
 * @returns Created notification
 */
export const createNotification = async (data: {
    user_id: string;
    title: string;
    content: string;
    url?: string;
}) => {
    const res = await axios.post<IApiResponse<INotification>>(API_URL, data);
    return res.data;
};

/**
 * Tạo thông báo mới với id được chèn vào :notificationId của url
 * @param data Notification data
 * @returns Created notification
 */
export const createNotificationWithId = async (data: {
    user_id: string;
    title: string;
    content: string;
    url?: string;
}) => {
    const res = await axios.post<IApiResponse<INotification>>(`${API_URL}/withId`, data);
    return res.data;
};

/**
 * Kiểm tra xem user có thông báo chưa đọc hay không
 * @returns Boolean indicating if there are unread notifications
 */
export const hasUnreadNotifications = async () => {
    const res = await axios.get<IApiResponse<INotification>>(`${API_URL}/has-unread`);
    return res.data;
};

/**
 * Đếm số thông báo chưa đọc
 * @returns Number of unread notifications
 */
export const countUnreadNotifications = async () => {
    const res = await axios.get<IApiResponse<INotification>>(`${API_URL}/count-unread`);
    return res.data;
};

/**
 * Đánh dấu thông báo đã đọc
 * @param id Notification ID
 * @returns Success message
 */
export const markAsRead = async (id: string) => {
    const res = await axios.patch<IApiResponse<INotification>>(
        `${API_URL}/${id}/read`,
        {}, // No body needed for PATCH
    );
    return res.data;
};

/**
 * Đánh dấu tất cả thông báo là đã đọc
 * @returns Success message and count of modified notifications
 */
export const markAsReadAll = async () => {
    const res = await axios.patch<IApiResponse<INotification>>(
        `${API_URL}/read-all`,
        {}, // No body needed
    );
    return res.data;
};

/**
 * Xóa thông báo
 * @param id Notification ID
 * @returns Success message
 */
export const deleteNotification = async (id: string) => {
    const res = await axios.delete<IApiResponse<INotification>>(`${API_URL}/${id}`);
    return res.data;
};
