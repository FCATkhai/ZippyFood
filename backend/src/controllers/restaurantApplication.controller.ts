/* eslint-disable prefer-const */
import { Request, Response, NextFunction } from "express";
import RestaurantApplication from "../models/RestaurantApplication.model";
import Restaurant from "../models/Restaurant.model";
import { IUploadRequest } from "../config/interface";
import { FilterQuery, SortOrder } from "mongoose";
import { deleteImage } from "../middleware/upload";
import User from "../models/User.model";
import Product from "../models/Product.model";

/**
 * Gửi đơn đăng ký nhà hàng
 * @route POST /api/restaurant-applications
 * @access customer_admin
 */
export const applyForRestaurant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const uploadReq = req as IUploadRequest;
    try {
        const user_id = req.user?._id;
        if (!user_id) {
            res.status(401);
            throw new Error("Unauthorized");
        }
        const application = await RestaurantApplication.findOne({ user_id: user_id });
        if (application) {
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

            const { restaurant_name, owner_name, phone, address } = req.body;
            const { identify_document, business_license, food_safety_certificate} = uploadReq.imageUrls;

            const application = new RestaurantApplication({
                user_id: user_id,
                restaurant_name,
                owner_name,
                phone,
                address,
                identify_document,
                business_license,
                food_safety_certificate,
            });

            await application.save();
            res.status(201).json({ success: true, message: "Application submitted successfully", application });
        }

    } catch (error) {
        const uploadReq = req as IUploadRequest;
        if (uploadReq.imageUrls) {
            const { identify_document, business_license, food_safety_certificate} = uploadReq.imageUrls;
            await deleteImage(identify_document);
            await deleteImage(business_license);
            await deleteImage(food_safety_certificate);

        }
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
        let {
            page = 1,
            limit = 10,
            search = "",
            status = "",
            sort = "desc" // Default sort descending
        } = req.query;

        page = Number(page);
        limit = Number(limit);

        const query: FilterQuery<unknown> = {};

        // Step 1: Find matching user IDs based on search (for user fields)
        if (search) {
            // Search in User collection
            const userQuery = {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { phone: { $regex: search, $options: "i" } }
                ]
            };
            const matchingUsers = await User.find(userQuery).select("_id");
            const userIds = matchingUsers.map(user => user._id);

            // Combine user_id and owner_name in the RestaurantApplication query
            query.$or = [];
            if (userIds.length > 0) {
                query.$or.push({ user_id: { $in: userIds } });
            }
            query.$or.push({ owner_name: { $regex: search, $options: "i" } });
        }

        // Add status filter
        if (status && ["pending", "approved", "rejected"].includes(status as string)) {
            query.status = status;
        }

        const total = await RestaurantApplication.countDocuments(query);

        const sortOption: { [key: string]: SortOrder } = { createdAt: sort === "desc" ? -1 : 1 };

        // Fetch applications with pagination, sorting, and population
        const applications = await RestaurantApplication.find(query)
            .populate("user_id", "name email")
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(limit);

        const hasMore = page * limit < total;

        res.status(200).json({
            success: true,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasMore,
            allApplications: applications
        });
    } catch (error) {
        next(error);
    }
};



// export const getAllApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//         let {
//             page = 1,
//             limit = 10,
//             search = "",
//             status = "",
//             sort = "desc" // Default sort descending
//         } = req.query;

//         page = Number(page);
//         limit = Number(limit);

//         const query: FilterQuery<unknown> = {};

//         // Add search conditions for user name and email
//         if (search) {
//             query.$or = [
//                 { "user_id.name": { $regex: search, $options: "i" } },
//                 { "user_id.email": { $regex: search, $options: "i" } },
//                 { "user_id.phone": { $regex: search, $options: "i" } }
//             ];
//         }

//         // Add status filter
//         if (status && ["pending", "approved", "rejected"].includes(status as string)) {
//             query.status = status;
//         }

//         const total = await RestaurantApplication.countDocuments(query);

//         const sortOption: { [key: string]: SortOrder } = { createdAt: sort === "desc" ? -1 : 1 };

//         // Fetch applications with pagination, sorting, and population
//         const applications = await RestaurantApplication.find(query)
//             .populate("user_id", "name email")
//             .sort(sortOption)
//             .skip((page - 1) * limit)
//             .limit(limit);

//         const hasMore = page * limit < total;

//         res.status(200).json({
//             success: true,
//             total,
//             page,
//             limit,
//             totalPages: Math.ceil(total / limit),
//             hasMore,
//             allApplications: applications
//         });
//     } catch (error) {
//         next(error);
//     }
// };

/**
 * Xét duyệt đơn đăng ký
 * @route PATCH /api/restaurant-applications/:id
 * @access admin
 */
export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["pending", "approved", "rejected"].includes(status)) {
            res.status(400);
            throw new Error("Invalid status value");
        }

        const application = await RestaurantApplication.findById(id);
        if (!application) {
            res.status(404);
            throw new Error("Application not found");
        }

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

        res.json({ success: true, message: "Application status updated", application });
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
        const application = await RestaurantApplication.findOne({ _id: id });

        if (!application) {
            res.status(404);
            throw new Error("Application not found");
        }
        if (application.status === "approved") {
            res.status(400);
            throw new Error("Cannot delete approved application");
        }

        await deleteImage(application.identify_document);
        await deleteImage(application.business_license);
        await deleteImage(application.food_safety_certificate);

        // Xoá nhà hàng tương ứng nếu có
        const restaurant = await Restaurant.findOne({ owner_id: application.user_id });
        if (restaurant) {
            const products = await Product.find({ restaurant_id: restaurant._id });
            if (products.length > 0) {
                // Xóa tất cả sản phẩm liên quan đến nhà hàng
                await Product.deleteMany({ restaurant_id: restaurant._id });
            }

            await restaurant.deleteOne();
        }

        await application.deleteOne();
        res.json({ success: true, message: "Application deleted successfully", application });
    } catch (error) {
        next(error);
    }
};