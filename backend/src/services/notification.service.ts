import { Model, Types, FilterQuery } from 'mongoose';
import Notification from '../models/Notification.model'; // Adjust path
import { INotification } from '~/shared/interface';

interface PaginationOptions {
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
}

class NotificationService {
    private notificationModel: Model<INotification>;

    constructor() {
        this.notificationModel = Notification;
    }

    /**
     * Tạo thông báo mới
     * @param data Dữ liệu thông báo
     * @returns Thông báo đã được tạo
     */
    async createNotification(data: Partial<INotification>): Promise<INotification> {
        try {
            const notification = await this.notificationModel.create({
                user_id: data.user_id,
                title: data.title,
                content: data.content,
                url: data.url,
                is_read: data.is_read || false,
            });
            return notification;
        } catch (error) {
            throw new Error(`Không thể tạo thông báo: ${(error as Error).message}`);
        }
    }

    /**
     * Lấy thông báo theo ID
     * @param id ID thông báo
     * @returns Thông báo hoặc null nếu không tìm thấy
     */
    async getNotificationById(id: Types.ObjectId): Promise<INotification | null> {
        try {
            const notification = await this.notificationModel.findById(id);
            return notification;
        } catch (error) {
            throw new Error(`Không thể lấy thông báo: ${(error as Error).message}`);
        }
    }

    /**
     * Lấy danh sách thông báo với bộ lọc và phân trang
     * @param filters Bộ lọc (user_id, is_read)
     * @param options Tùy chọn phân trang và sắp xếp
     * @returns Danh sách thông báo phân trang và metadata
     */
    async getNotifications(
        filters: {
            user_id?: Types.ObjectId;
            is_read?: boolean;
        } = {},
        options: PaginationOptions = {}
    ): Promise<{
        notifications: INotification[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasMore: boolean;
    }> {
        try {
            const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;

            // Build filter query
            const query: FilterQuery<INotification> = {};
            if (filters.user_id) query.user_id = filters.user_id;
            if (filters.is_read !== undefined) query.is_read = filters.is_read;

            // Get total count
            const total = await this.notificationModel.countDocuments(query);

            // Fetch paginated notifications
            const notifications = await this.notificationModel
                .find(query)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit);

            const totalPages = Math.ceil(total / limit);
            const hasMore = page * limit < total;

            return {
                notifications,
                total,
                page,
                limit,
                totalPages,
                hasMore,
            };
        } catch (error) {
            throw new Error(`Không thể lấy danh sách thông báo: ${(error as Error).message}`);
        }
    }

    /**
     * Cập nhật thông báo theo ID
     * @param id ID thông báo
     * @param data Dữ liệu cần cập nhật
     * @returns Thông báo đã cập nhật hoặc null nếu không tìm thấy
     */
    async updateNotification(id: Types.ObjectId, data: Partial<INotification>): Promise<INotification | null> {
        try {
            const notification = await this.notificationModel.findByIdAndUpdate(
                id,
                { $set: data },
                { new: true, runValidators: true }
            );
            if (!notification) {
                throw new Error('Không tìm thấy thông báo');
            }
            return notification;
        } catch (error) {
            throw new Error(`Không thể cập nhật thông báo: ${(error as Error).message}`);
        }
    }

    /**
     * Xóa thông báo theo ID
     * @param id ID thông báo
     * @returns Thông báo đã xóa hoặc null nếu không tìm thấy
     */
    async deleteNotification(id: Types.ObjectId): Promise<INotification | null> {
        try {
            const notification = await this.notificationModel.findByIdAndDelete(id);
            if (!notification) {
                throw new Error('Không tìm thấy thông báo');
            }
            return notification;
        } catch (error) {
            throw new Error(`Không thể xóa thông báo: ${(error as Error).message}`);
        }
    }

    /**
     * Đánh dấu thông báo là đã đọc theo ID
     * @param id ID thông báo
     * @returns Thông báo đã cập nhật hoặc null nếu không tìm thấy
     */
    async markAsRead(id: Types.ObjectId): Promise<INotification | null> {
        return await this.updateNotification(id, { is_read: true });
    }

    /**
     * Đánh dấu tất cả thông báo là đã đọc cho một người dùng
     * @param userId ID người dùng
     * @returns Số lượng thông báo được cập nhật
     */
    async markAllAsRead(userId: Types.ObjectId): Promise<number> {
        try {
            const result = await this.notificationModel.updateMany(
                { user_id: userId, is_read: false },
                { $set: { is_read: true } }
            );
            return result.modifiedCount;
        } catch (error) {
            throw new Error(`Không thể đánh dấu tất cả thông báo là đã đọc: ${(error as Error).message}`);
        }
    }

    /**
     * Kiểm tra xem người dùng có thông báo chưa đọc không
     * @param userId ID người dùng
     * @returns True nếu có thông báo chưa đọc
     */
    async hasUnreadNotifications(userId: Types.ObjectId): Promise<boolean> {
        try {
            const exists = await this.notificationModel.exists({ user_id: userId, is_read: false });
            return !!exists;
        } catch (error) {
            throw new Error(`Không thể kiểm tra thông báo chưa đọc: ${(error as Error).message}`);
        }
    }

    /**
     * Đếm số thông báo chưa đọc của người dùng
     * @param userId ID người dùng
     * @returns Số lượng thông báo chưa đọc
     */
    async countUnreadNotifications(userId: Types.ObjectId): Promise<number> {
        try {
            return await this.notificationModel.countDocuments({ user_id: userId, is_read: false });
        } catch (error) {
            throw new Error(`Không thể đếm thông báo chưa đọc: ${(error as Error).message}`);
        }
    }
}

export default new NotificationService();