import { Request, Response, NextFunction } from "express";
import Cart from "../models/Cart.model";
import Product from "../models/Product.model";
import { Types } from "mongoose";

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

        const cart = await Cart.findOne({ customer_id });
        res.json({ success: true, cart: cart || { customer_id, restaurant_id: null, items: [] }});
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

        if (!Types.ObjectId.isValid(product_id)) {
            res.status(400);
            throw new Error("Invalid product ID");
        }
        if (!Number.isInteger(quantity) || quantity <= 0) {
            res.status(400);
            throw new Error("Quantity must be a positive integer");
        }

        const product = await Product.findById(product_id);
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        let cart = await Cart.findOne({ customer_id });
        if (!cart) {
            // Create new cart with the product's restaurant_id
            cart = new Cart({
                customer_id,
                restaurant_id: product.restaurant_id, 
                items: []
            });
        }

        // Check if the product's restaurant matches the cart's restaurant
        if (cart.restaurant_id && !cart.restaurant_id.equals(product.restaurant_id)) {
            // Reset cart if restaurant differs
            cart.items = [];
            cart.restaurant_id = product.restaurant_id;
        }

        const existingItem = cart.items.find(item => item.product_id.equals(product_id));
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                product_id,
                name: product.name,
                quantity,
                price: product.price, 
                final_price: product.final_price,
                image: product.image 
            });
        }

        await cart.save();
        res.json({ success: true, message: "Product added to cart", cart });
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

        if (!Types.ObjectId.isValid(product_id)) {
            res.status(400);
            throw new Error("Invalid product ID");
        }
        if (!Number.isInteger(quantity) || quantity < 0) {
            res.status(400);
            throw new Error("Quantity must be a non-negative integer");
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
            cart.items = cart.items.filter(item => !item.product_id.equals(product_id));
            // If cart becomes empty, optionally reset restaurant_id
            if (cart.items.length === 0) {
                cart.restaurant_id = null;
            }
        }

        await cart.save();
        res.json({ success: true, message: "Cart updated", cart });
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
        if (!Types.ObjectId.isValid(product_id)) {
            res.status(400);
            throw new Error("Invalid product ID");
        }

        const cart = await Cart.findOne({ customer_id });
        if (!cart) {
            res.status(404);
            throw new Error("Cart not found");
        }

        cart.items = cart.items.filter(item => item.product_id.toString() !== product_id);
        // If cart becomes empty, reset restaurant_id
        if (cart.items.length === 0) {
            cart.restaurant_id = null;
        }

        await cart.save();
        await cart.populate("items.product_id", "name price restaurant_id");
        res.json({ success: true, message: "Product removed from cart", cart });
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

        const cart = await Cart.findOne({ customer_id });
        if (cart) {
            cart.items = [];
            cart.restaurant_id = null; // Reset restaurant_id when clearing
            await cart.save();
            res.json({ success: true, message: "Cart cleared", cart });
        } else {
            res.json({ success: true, message: "Cart cleared", cart: { customer_id, restaurant_id: null, items: [] } });
        }
    } catch (error) {
        next(error);
    }
};