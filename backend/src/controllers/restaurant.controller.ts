import { Request, Response, NextFunction } from "express";
import Restaurant from '../models/Restaurant.model';
import RestaurantApplication from '../models/RestaurantApplication.model';


/**
 * Tạo nhà hàng
 * @route POST /api/restaurants
 * @access restaurant_owner
 */
export const createRestaurant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const owner_id = req.user?._id;
        if (!owner_id) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        const { name, address } = req.body;
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
        const restaurants = await Restaurant.find();
        res.json(restaurants);
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
        res.json(restaurant);
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
        if (restaurant.owner_id.toString() !== req.user?._id.toString() || req.user?.role !== "admin") {
            res.status(403);
            throw new Error("Unauthorized");
        }

        const oldName = restaurant.name;
        const oldAddress = restaurant.location?.address;

        restaurant.name = req.body.name || restaurant.name;
        restaurant.thumbnail = req.file?.path || restaurant.thumbnail;
        restaurant.phone = req.body.phone || restaurant.phone;
        restaurant.location = req.body.location || restaurant.location;
        restaurant.open_hours = req.body.open_hours || restaurant.open_hours;

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

        res.json({ message: "Restaurant updated successfully", restaurant });
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
        res.json({ message: "All restaurants deleted successfully" });

    } catch (error) {
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

        await restaurant.deleteOne();
        res.json({ message: "Restaurant deleted successfully" });
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
