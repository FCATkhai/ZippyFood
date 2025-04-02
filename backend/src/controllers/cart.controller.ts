import { Request, Response, NextFunction } from "express";
import Cart from "../models/Cart.model";
import Product from "../models/Product.model";

/**
 * Lấy giỏ hàng của khách hàng
 * @route GET /api/cart
 * @access customer_admin
 */
export const getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const customer_id = req.user?._id;
        if (!customer_id) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        const cart = await Cart.findOne({ customer_id }).populate("items.product_id", "name price");
        res.json(cart || { customer_id, items: [] });
    } catch (error) {
        next(error);
    }
};

/**
 * Thêm sản phẩm vào giỏ hàng
 * @route POST /api/cart
 * @access customer_admin
 */
export const addToCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const customer_id = req.user?._id;
        const { product_id, quantity } = req.body;

        if (!customer_id) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        const product = await Product.findById(product_id);
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        let cart = await Cart.findOne({ customer_id });
        if (!cart) {
            cart = new Cart({ customer_id, items: [] });
        }

        const existingItem = cart.items.find(item => item.product_id.equals(product_id));

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ product_id, name: product.name, quantity, price: product.final_price });
        }

        await cart.save();
        res.json({ message: "Product added to cart", cart });
    } catch (error) {
        next(error);
    }
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 * @route PATCH /api/cart
 * @access customer_admin
 */
export const updateCartItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const customer_id = req.user?._id;
        const { product_id, quantity } = req.body;

        if (!customer_id) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        const cart = await Cart.findOne({ customer_id });
        if (!cart) {
            res.status(404);
            throw new Error("Cart not found");
        }

        const item = cart.items.find(item => item.product_id.equals(product_id));
        if (!item) {
            res.status(404);
            throw new Error("Product not in cart");
        }

        if (quantity > 0) {
            item.quantity = quantity;
        } else {
            // quantity = 0 or negative -> drop product out of cart
            cart.items = cart.items.filter(item => !item.product_id.equals(product_id));
        }

        await cart.save();
        res.json({ message: "Cart updated", cart });
    } catch (error) {
        next(error);
    }
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * @route DELETE /api/cart/:product_id
 * @access customer_admin
 */
export const removeFromCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const customer_id = req.user?._id;
        const { product_id } = req.params;

        if (!customer_id) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        const cart = await Cart.findOne({ customer_id });
        if (!cart) {
            res.status(404);
            throw new Error("Cart not found");
        }

        cart.items = cart.items.filter(item => !item.product_id.equals(product_id));

        await cart.save();
        res.json({ message: "Product removed from cart", cart });
    } catch (error) {
        next(error);
    }
};

/**
 * Xóa toàn bộ giỏ hàng
 * @route DELETE /api/cart
 * @access customer_admin
 */
export const clearCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const customer_id = req.user?._id;

        if (!customer_id) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        await Cart.findOneAndDelete({ customer_id });

        res.json({ message: "Cart cleared" });
    } catch (error) {
        next(error);
    }
};
