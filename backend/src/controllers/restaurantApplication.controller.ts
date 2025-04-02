import { Request, Response, NextFunction } from "express";
import RestaurantApplication from "../models/RestaurantApplication.model";
import Restaurant from "../models/Restaurant.model";
import { IUploadRequest } from "~/shared/interface";

/**
 * Gửi đơn đăng ký nhà hàng
 * @route POST /api/restaurant-applications
 * @access customer_admin
 */
export const applyForRestaurant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    //@ts-ignore
    const uploadReq = req as IUploadRequest;
    try {
        const user_id = req.user?._id;
        if (!user_id) {
            res.status(401);
            throw new Error("Unauthorized");
        }
        const application = await RestaurantApplication.findOne({user_id: user_id});
        if (application ) {
            if (application.status == "pending") {
                res.status(400);
                throw new Error("Your application are being processed");
            }
            if (application.status == "approved") {
                res.status(400);
                throw new Error("Your application has been approved");
            }
        }
        if (!uploadReq.imageUrls) {
            res.status(400);
            throw new Error("Images not found");
        } else {
            const application = new RestaurantApplication({
                user_id: user_id,
                restaurant_name: req.body.restaurant_name,
                owner_name: req.body.owner_name,
                phone: req.body.phone,
                address: req.body.address,
                identify_document: uploadReq.imageUrls.identify_document,
                business_license: uploadReq.imageUrls.business_license,
                food_safety_certificate: uploadReq.imageUrls.food_safety_certificate,
            });
    
            await application.save();
            res.status(201).json({ message: "Application submitted successfully", application });
        }
        
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
        res.status(200).json({success: true, allApplications: applications});
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

        const application = await RestaurantApplication.findById(id);
        if (!application) {
            res.status(404);
            throw new Error("Application not found");
        }

        // if (application.status === "approved") {
        //     res.status(400);
        //     throw new Error("Application is already approved");
        // }

        application.status = status;
        await application.save();

        // Nếu đơn được duyệt -> Tự động tạo nhà hàng
        if (status === "approved") {
            const newRestaurant = new Restaurant({
                owner_id: application.user_id, // Đảm bảo đây là chủ nhà hàng
                name: application.restaurant_name,
                location: {
                    address: application.address
                }
            });

            await newRestaurant.save();
        }

        res.json({ message: "Application status updated", application });
    } catch (error) {
        next(error);
    }
};


/**
 * Xoá đơn đăng ký
 * @route DELETE /api/restaurant-applications/:id
 * @access admin
 */
export const deleteApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const application = await RestaurantApplication.findOne({_id: id});

        if (!application) {
            res.status(404);
            throw new Error("Application not found");
        }
        if (application.status === "approved") {
            res.status(400);
            throw new Error("Cannot delete approved application");
        }

        res.json({ message: "Application deleted successfully", application });
    } catch (error) {
        next(error);
    }
};