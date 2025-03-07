import { Request, Response, NextFunction } from "express";
import RestaurantApplication from "../models/RestaurantApplication";

/**
 * Gửi đơn đăng ký nhà hàng
 * @route POST /api/restaurant-applications
 * @access customer
 */
export const applyForRestaurant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user_id = req.user?._id;
        if (!user_id) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        const application = new RestaurantApplication({
            user_id,
            ...req.body
        });

        await application.save();
        res.status(201).json({ message: "Application submitted successfully", application });
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy danh sách đơn đăng ký nhà hàng
 * @route GET /api/restaurant-applications
 * @access admin
 */
export const getAllApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const applications = await RestaurantApplication.find().populate("user_id", "name email");
        res.json(applications);
    } catch (error) {
        next(error);
    }
};

/**
 * Xét duyệt đơn đăng ký
 * @route PATCH /api/restaurant-applications/:id
 * @access admin
 */
export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!["approved", "rejected"].includes(status)) {
            res.status(400);
            throw new Error("Invalid status value");
        }

        const application = await RestaurantApplication.findByIdAndUpdate(id, { status }, { new: true });
        if (!application) {
            res.status(404);
            throw new Error("Application not found");
        }

        res.json({ message: "Application status updated", application });
    } catch (error) {
        next(error);
    }
};