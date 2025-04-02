import { Request, Response, NextFunction } from "express";
import Order from "../models/Order.model";
import Cart from "../models/Cart.model";
import { ICartItem, IProduct } from "~/shared/interface";
import { Types} from "mongoose";
/**
 * Tạo đơn hàng từ giỏ hàng
 * @route POST /api/orders
 * @access customer_admin
 */

function isIProduct(product: Types.ObjectId | IProduct): product is IProduct {
    return (product as IProduct).restaurant_id !== undefined;
}

export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const customer_id = req.user?._id;
        if (!customer_id) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        const { address, note } = req.body;

        // Lấy giỏ hàng của người dùng
        const cart = await Cart.findOne({ customer_id }).populate<{items: ICartItem[]}>("items.product_id");
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
                subtotal: item.quantity * item.price,
                category_id: item.product_id.category_id,
            }
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

        res.status(201).json({ message: "Order placed successfully", order });
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy danh sách đơn hàng của người dùng hiện tại
 * @route GET /api/orders
 * @access customer_admin
 */
export const getOrdersByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const customer_id = req.user?._id;
        if (!customer_id) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        const orders = await Order.find({ customer_id }).sort({ createdAt: -1 });
        res.json(orders);
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

        const orders = await Order.find({ restaurant_id }).sort({ createdAt: -1 });
        res.json(orders);
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

        if (!["pending", "processing", "ordering", "completed", "cancelled"].includes(status)) {
            res.status(400);
            throw new Error("Invalid status value");
        }

        const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        res.json({ message: "Order status updated", order });
    } catch (error) {
        next(error);
    }
};
