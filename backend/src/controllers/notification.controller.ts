import { Request, Response, NextFunction } from "express";
import Notification from "../models/Notification.model";
import { INotification } from "~/shared/interface";

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

        const notifications = await Notification.find({ user_id: userId }).sort({ createdAt: -1 });

        res.json({ success: true, notifications });
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

        if (!user_id || !title || !content) {
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
            throw new Error("You are not authorized to delete this notification");
        }

        notification.is_read = true;
        await notification.save();

        res.json({ success: true, message: "Notification marked as read" });
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
