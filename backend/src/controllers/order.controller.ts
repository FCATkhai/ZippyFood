/* eslint-disable prefer-const */
import { Request, Response, NextFunction } from "express";
import Order from "../models/Order.model";
import Cart from "../models/Cart.model";
import User from "../models/User.model"; 
import Restaurant from "../models/Restaurant.model"; 
import { ICartItem, IProduct } from "~/shared/interface";
import { Types, FilterQuery } from "mongoose";

function isIProduct(product: Types.ObjectId | IProduct): product is IProduct {
    return (product as IProduct).restaurant_id !== undefined;
}
/**
 * Tạo đơn hàng từ giỏ hàng
 * @route POST /api/orders
 * @access customer_admin
 */

export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const customer_id = req.user?._id;
        if (!customer_id) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        const { address, note } = req.body;
        if (!address || typeof address !== "string" || address.trim() === "") {
            res.status(400);
            throw new Error("Address is required");
        }

        const cart = await Cart.findOne({ customer_id }).populate<{ items: ICartItem[] }>("items.product_id");
        if (!cart || cart.items.length === 0) {
            res.status(400);
            throw new Error("Cart is empty");
        }

        const firstProduct = cart.items[0].product_id;
        if (!isIProduct(firstProduct)) {
            throw new Error("Failed to populate product data");
        }
        const restaurant_id = firstProduct.restaurant_id;
        const products = cart.items.map(item => {
            if (!isIProduct(item.product_id)) {
                throw new Error("Failed to populate product data");
            }
            return {
                product_id: item.product_id._id,
                name: item.product_id.name,
                quantity: item.quantity,
                price: item.price,
                final_price: item.final_price,
                image: item.product_id.image,
                subtotal: item.quantity * item.final_price,
                category_id: item.product_id.category_id, 
            };
        });

        let total_price = 0;
        for (const item of products) {
            total_price += item.subtotal;
        }

        const order = new Order({
            customer_id,
            restaurant_id,
            products,
            total_price,
            address,
            note,
        });

        await order.save();
        await Cart.findOneAndDelete({ customer_id });

        res.status(201).json({ success: true, message: "Order placed successfully", order });
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy danh sách đơn hàng của 1 người dùng
 * @route GET /api/orders/customer/:customer_id
 * @access customer_admin
 */
export const getOrdersByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { customer_id } = req.params;
        let { page = 1, limit = 10, status = "" } = req.query;

        if (!customer_id || !Types.ObjectId.isValid(customer_id)) {
            res.status(400);
            throw new Error("Invalid customer ID");
        }

        page = Number(page);
        limit = Number(limit);

        const query: FilterQuery<unknown> = { customer_id };
        if (status && ["pending", "processing", "ordering", "completed", "cancelled"].includes(status as string)) {
            query.status = status;
        }

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort({ createdAt: -1 }) // Newest first
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("restaurant_id", "name"); // Optional: Include restaurant name

        const hasMore = page * limit < total;

        res.json({
            success: true,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasMore,
            orders
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy danh sách đơn hàng của nhà hàng
 * @route GET /api/orders/restaurant/:restaurant_id
 * @access owner_admin
 */
export const getOrdersByRestaurant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { restaurant_id } = req.params;
        let { page = 1, limit = 10, status = "" } = req.query;

        if (!restaurant_id || !Types.ObjectId.isValid(restaurant_id)) {
            res.status(400);
            throw new Error("Invalid restaurant ID");
        }

        page = Number(page);
        limit = Number(limit);

        const query: FilterQuery<unknown> = { restaurant_id };
        if (status && ["pending", "processing", "ordering", "completed", "cancelled"].includes(status as string)) {
            query.status = status;
        }

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort({ createdAt: -1 }) // Newest first
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("customer_id", "name phone"); // Optional: Include customer details

        const hasMore = page * limit < total;

        res.json({
            success: true,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasMore,
            orders
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy tất cả đơn hàng (admin)
 * @route GET /api/orders
 * @access admin
 */
export const getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let { page = 1, limit = 10, status = "", search = "" } = req.query;

        page = Number(page);
        limit = Number(limit);

        const query: FilterQuery<unknown> = {};
        if (status && ["pending", "processing", "ordering", "completed", "cancelled"].includes(status as string)) {
            query.status = status;
        }

        if (search) {
            // Check if search is a valid MongoDB ObjectId
            const isValidObjectId = Types.ObjectId.isValid(search as string);
            
            const restaurants = await Restaurant.find({
                name: { $regex: search, $options: "i" }
            }).select("_id");
            const restaurantIds = restaurants.map(r => r._id);

            const users = await User.find({
                phone: { $regex: search, $options: "i" }
            }).select("_id");
            const userIds = users.map(u => u._id);

            // Build the $or array with conditions
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const orConditions: Array<Record<string, any>> = [
                { restaurant_id: { $in: restaurantIds } },
                { customer_id: { $in: userIds } }
            ];

            // Add order ID search if it's a valid ObjectId
            if (isValidObjectId) {
                orConditions.push({ _id: new Types.ObjectId(search as string) });
            }

            query.$or = orConditions;
        }

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort({ createdAt: -1 }) // Newest first
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("customer_id", "name phone")
            .populate("restaurant_id", "name");

        const hasMore = page * limit < total;

        res.json({
            success: true,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasMore,
            orders
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cập nhật trạng thái đơn hàng
 * @route PATCH /api/orders/:id
 * @access owner_admin
 */
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!Types.ObjectId.isValid(id)) {
            res.status(400);
            throw new Error("Invalid order ID");
        }

        if (!["pending", "processing", "ordering", "completed", "cancelled"].includes(status)) {
            res.status(400);
            throw new Error("Invalid status value");
        }

        const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
            .populate("customer_id", "name phone")
            .populate("restaurant_id", "name");
        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        res.json({ success: true, message: "Order status updated", order });
    } catch (error) {
        next(error);
    }
};