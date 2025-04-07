/* eslint-disable prefer-const */
import { Request, Response, NextFunction } from "express";
import Restaurant from '../models/Restaurant.model';
import RestaurantApplication from '../models/RestaurantApplication.model';
import { USER_ROLES } from "../config/constants";
import { deleteImage } from "../middleware/upload";
import { FilterQuery } from "mongoose";
import Product from "../models/Product.model";
import { IRestaurant } from "~/shared/interface";

/**
 * Tạo nhà hàng
 * @route POST /api/restaurants
 * @access restaurant_owner
 */
export const createRestaurant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { owner_id, name, address } = req.body;
        const thumbnailUrl = req.file?.path;

        const restaurant = new Restaurant({
            name: name,
            owner_id: owner_id,
            thumbnail: thumbnailUrl,
            location: {
                address: address
            }
        });

        await restaurant.save();
        res.status(201).json({ success: true, data: restaurant });
    } catch (error) {
        // Check for duplicate key error (E11000)
        // @ts-expect-error 
        if (error.code === 11000 || error.name === "MongoServerError" && error.code === 11000) {
            res.status(409); // Conflict status code
            return next(new Error(`Tên nhà hàng "${req.body.name}" đã tồn tại`));
        }
        next(error);
    }
};

/**
 * Lấy danh sách nhà hàng
 * @route GET /api/restaurants
 * @access Public
 */
export const getRestaurants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let {
            page = 1,
            limit = 10,
            search = "",
            is_active = "",
            min_rating = 0,
            sort_by = "createdAt", // Default sort by createdAt
            sort = "desc", // Default sort descending
            check_open = "false" //check if restaurant is open now
        } = req.query;

        // Convert query params to appropriate types
        page = Number(page);
        limit = Number(limit);
        min_rating = Number(min_rating);
        check_open = String(check_open);

        // Build query object
        const query: FilterQuery<IRestaurant> = {};

        // Search by name or phone
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } }
            ];
        }

        // Filter by is_active
        if (is_active === "true" || is_active === "false") {
            query.is_active = is_active === "true";
        }

        // Filter by minimum rating
        if (min_rating > 0) {
            query.rating = { $gte: min_rating };
        }

        // Filter by current opening hours if check_open is true
        if (check_open === "true") {
            const now = new Date();
            const currentDay = now.toLocaleString('en-US', { weekday: 'long' });
            const currentTime = now.toTimeString().slice(0, 5); // Get HH:MM format

            query.open_hours = {
                $elemMatch: {
                    day: currentDay,
                    time_slots: {
                        $elemMatch: {
                            start: { $lte: currentTime },
                            end: { $gte: currentTime }
                        }
                    }
                }
            };
        }

        // Count total documents
        const total = await Restaurant.countDocuments(query);

        // Build sort options
        const validSortFields = ["createdAt", "rating"];
        const sortField = validSortFields.includes(sort_by as string) ? sort_by : "createdAt";
        const sortOption: { [key: string]: 1 | -1 } = {
            //TODO: Fix type error
            //@ts-ignore
            [sortField]: sort === "desc" ? -1 : 1
        };

        // Fetch restaurants with pagination and sorting
        const restaurants = await Restaurant.find(query)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(limit);

        const hasMore = page * limit < total;

        res.status(200).json({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasMore,
            data: restaurants
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy thông tin chi tiết nhà hàng
 * @route GET /api/restaurants/:id
 * @access Public
 */
export const getRestaurantById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            res.status(404);
            throw new Error("Restaurant not found");
        }
        res.json({ success: true, restaurant });
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy thông tin chi tiết nhà hàng bằng query: owner_id
 * @route GET /api/restaurants/get-one
 * @access Public
 */
export const getRestaurant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { owner_id } = req.query;
        const restaurant = await Restaurant.findOne({ owner_id });
        if (!restaurant) {
            res.status(404);
            throw new Error("Restaurant not found");
        }
        res.json({ success: true, restaurant });
    } catch (error) {
        next(error);
    }
};

/**
 * Cập nhật thông tin nhà hàng
 * @route PATCH /api/restaurants/:id
 * @access owner_admin
 */
export const updateRestaurant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            res.status(404);
            throw new Error("Restaurant not found");
        }

        // Kiểm tra quyền sở hữu
        if (restaurant.owner_id.toString() !== req.user?._id.toString() && req.user?.role !== USER_ROLES.ADMIN) {
            res.status(403);
            throw new Error("Unauthorized");
        }

        const oldName = restaurant.name;
        const oldAddress = restaurant.location?.address;

        const { name, phone, location, open_hours, is_active } = req.body;

        if (req.file?.path) {
            // Xóa ảnh cũ trên Cloudinary
            await deleteImage(restaurant.thumbnail);
        }

        restaurant.name = name || restaurant.name;
        restaurant.thumbnail = req.file?.path || restaurant.thumbnail;
        restaurant.phone = phone || restaurant.phone;
        restaurant.location = location ? JSON.parse(location) : restaurant.location;
        restaurant.open_hours = open_hours ? JSON.parse(open_hours) : restaurant.open_hours;
        restaurant.is_active = is_active ? JSON.parse(is_active) : restaurant.is_active;


        await restaurant.save();

        // Nếu tên hoặc địa chỉ thay đổi, cập nhật đơn đăng ký nhà hàng tương ứng
        if (oldName !== restaurant.name || oldAddress !== restaurant.location?.address) {
            const application = await RestaurantApplication.findOne({ user_id: restaurant.owner_id });
            if (application) {
                application.restaurant_name = restaurant.name;
                application.address = restaurant.location?.address || "";
                await application.save();
            }
        }

        res.json({ success: true, message: "Restaurant updated successfully", restaurant });
    } catch (error) {
        await deleteImage(req.file?.path); // Xóa ảnh mới tải lên nếu có lỗi xảy ra

        // Check for duplicate key error (E11000)
        // @ts-expect-error 
        if (error.code === 11000 || error.name === "MongoServerError" && error.code === 11000) {
            res.status(409); // Conflict status code
            return next(new Error(`Tên nhà hàng "${req.body.name}" đã tồn tại`));
        }
        next(error);
    }
};

/**
 * Xóa nhà hàng
 * @route DELETE /api/restaurants/:id
 * @access restaurant_owner, admin
 */
export const deleteRestaurant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            res.status(404);
            throw new Error("Restaurant not found");
        }

        // Chỉ cho phép chủ nhà hàng hoặc admin xóa
        if (restaurant.owner_id.toString() !== req.user?._id.toString() && req.user?.role !== "admin") {
            res.status(401);
            throw new Error("Unauthorized");
        }

        const application = await RestaurantApplication.findOne({ restaurant_name: restaurant.name });
        if (application) {
            await application.deleteOne();
        }

        const products = await Product.find({ restaurant_id: restaurant._id });
        if (products.length > 0) {
            // Xóa tất cả sản phẩm liên quan đến nhà hàng
            await Product.deleteMany({ restaurant_id: restaurant._id });
        }

        // Xoá ảnh trên cloudinary
        await deleteImage(restaurant.thumbnail);

        await restaurant.deleteOne();
        res.json({ success: true, message: "Restaurant deleted successfully" });
    } catch (error) {
        next(error);
    }
};

/**
 * Xóa toàn bộ nhà hàng
 * @route DELETE /api/restaurants/
 * @access admin
 */
export const deleteAllRestaurants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await Restaurant.deleteMany();
        res.json({ success: true, message: "All restaurants deleted successfully" });

    } catch (error) {
        next(error);
    }
};

// export const deleteRestaurant = async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const restaurant = await Restaurant.findById(id);
//     if (!restaurant) {
//         res.status(404);
//         throw new Error('Not found');
//     }

//     // Lấy public_id từ URL Cloudinary để xóa ảnh
//     const imageUrl = restaurant.thumbnail;
//     const publicId = imageUrl.split('/').pop()?.split('.')[0];

//     await cloudinary.uploader.destroy(`restaurants/${publicId}`);

//     await restaurant.deleteOne();
//     res.json({ success: true, message: 'Nhà hàng đã bị xóa' });
// };
