/* eslint-disable prefer-const */
import { Request, Response, NextFunction } from "express";
import Notification from "../models/Notification.model";
import { INotification } from "~/shared/interface";
import { FilterQuery } from "mongoose";
import notificationService from "../services/notification.service";
/**
 * Lấy danh sách thông báo của user
 * @route GET /api/notifications
 * @access Private (Chỉ user đăng nhập)
 */
export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        // Extract query parameters with defaults
        let {
            page = 1,
            limit = 10,
            is_read = "", // Optional filter for read/unread status
            sort = "desc", // Default sort descending by createdAt
        } = req.query;

        // Convert to numbers
        page = Number(page);
        limit = Number(limit);

        // Build query
        const query: FilterQuery<INotification> = { user_id: userId };
        if (is_read === "true" || is_read === "false") {
            query.is_read = is_read === "true"; // Convert string to boolean
        }

        // Get total count of matching notifications
        const total = await Notification.countDocuments(query);

        // Sort option
        const sortOption: { [key: string]: 1 | -1 } = { createdAt: sort === "desc" ? -1 : 1 };

        // Fetch paginated notifications
        const notifications = await Notification.find(query)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(limit);

        // Calculate pagination metadata
        const hasMore = page * limit < total;

        res.status(200).json({
            success: true,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasMore,
            notifications,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Tạo thông báo mới
 * @route POST /api/notifications
 * @access Private (Admin hoặc hệ thống)
 */
export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id, title, content, url } = req.body;

        if (!user_id || !title) {
            res.status(400);
            throw new Error("Missing required fields");
        }

        const newNotification: INotification = new Notification({
            user_id,
            title,
            content,
            url,
        });

        await newNotification.save();

        res.status(201).json({ success: true, message: "Notification created", notification: newNotification });
    } catch (error) {
        next(error);
    }
};

/**
 * Tạo thông báo mới với id được chèn vào :notificationId của url
 * @route POST /api/notifications/withId
 * @access Private (Admin hoặc hệ thống)
 */
export const createNotificationWithId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id, title, content, url } = req.body;

        if (!user_id || !title || !url) {
            res.status(400);
            throw new Error("Missing required fields");
        }

        const data = {
            user_id,
            title,
            content,
            url
        }
        const newNotification: INotification = await notificationService.createNotificationWithId(data);

        res.status(201).json({ success: true, message: "Notification created", notification: newNotification });
    } catch (error) {
        next(error);
    }
};

/**
 * Kiểm tra xem user có thông báo chưa đọc hay không
 * @route GET /api/notifications/has-unread
 * @access Private (Chỉ user đăng nhập)
 */
export const hasUnreadNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        // Check if there are any unread notifications
        const hasUnread = await Notification.exists({ user_id: userId, is_read: false });

        res.json({
            success: true,
            hasUnread: !!hasUnread, // Convert to boolean (null if none exist)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Đếm số thông báo chưa đọc của user
 * @route GET /api/notifications/count-unread
 * @access Private (Chỉ user đăng nhập)
 */
export const countUnreadNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        // Count unread notifications
        const unreadCount = await Notification.countDocuments({ user_id: userId, is_read: false });

        res.json({
            success: true,
            unreadCount,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Đánh dấu thông báo đã đọc
 * @route PATCH /api/notifications/:id/read
 * @access Private (Chỉ user sở hữu thông báo)
 */
export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const notification = await Notification.findById(id);
        if (!notification) {
            res.status(404);
            throw new Error("Notification not found");
        }

        if (notification.user_id.toString() !== userId.toString()) {
            res.status(403);
            throw new Error("You are cannot read this notification");
        }

        notification.is_read = true;
        await notification.save();

        res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        next(error);
    }
};

/**
 * Đánh dấu tất cả thông báo của user là đã đọc
 * @route PATCH /api/notifications/read-all
 * @access Private (Chỉ user đăng nhập)
 */
export const markAsReadAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        // Update all notifications for the user where is_read is false
        const result = await Notification.updateMany(
            { user_id: userId, is_read: false },
            { $set: { is_read: true } }
        );

        res.json({
            success: true,
            message: `Marked ${result.modifiedCount} notifications as read`,
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Xóa thông báo
 * @route DELETE /api/notifications/:id
 * @access Private (Chỉ user sở hữu hoặc admin)
 */
export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const notification = await Notification.findById(id);
        if (!notification) {
            res.status(404);
            throw new Error("Notification not found");
        }

        if (notification.user_id.toString() !== userId.toString() && req.user?.role !== "admin") {
            res.status(403);
            throw new Error("You are not authorized to delete this notification");
        }

        await notification.deleteOne();

        res.json({ success: true, message: "Notification deleted" });
    } catch (error) {
        next(error);
    }
};
