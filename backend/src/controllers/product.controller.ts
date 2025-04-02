import { Request, Response, NextFunction } from "express";
import Product from "../models/Product.model";

/**
 * Tạo món ăn mới
 * @route POST /api/products
 * @access owner_admin
 */
export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { restaurant_id, name, description, tags, price, discount, category_id } = req.body;

        if (!restaurant_id || !name || !price || !category_id) {
            res.status(400);
            throw new Error("Restaurant ID, Name, Price, and Category ID are required");
        }

        //TODO: Tạm tời để tags được nhập trực tiếp dạng mảng, sửa lại sau
        const arrTags = JSON.parse(tags.replace(/^"|"$/g, ''));
        const imageUrl = req.file?.path;
        const product = new Product({
            restaurant_id,
            name,
            description,
            tags: arrTags,
            image: imageUrl,
            price,
            discount,
            category_id,
        });

        await product.save();
        res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy danh sách món ăn của một nhà hàng
 * @route GET /api/products/:restaurant_id
 * @access Public
 */
export const getProductsByRestaurant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { restaurant_id } = req.params;
        const products = await Product.find({ restaurant_id });

        res.json(products);
    } catch (error) {
        next(error);
    }
};

/**
 * Cập nhật món ăn
 * @route PATCH /api/products/:id
 * @access owner_admin
 */
export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, tags, image, price, discount, status, category_id } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        if (name) product.name = name;
        if (description) product.description = description;
        if (tags) product.tags = tags;
        if (image) product.image = image;
        if (price) product.price = price;
        if (discount !== undefined) product.discount = discount;
        if (status) product.status = status;
        if (category_id) product.category_id = category_id;

        await product.save();
        res.json({ message: "Product updated successfully", product });
    } catch (error) {
        next(error);
    }
};

/**
 * Xóa món ăn
 * @route DELETE /api/products/:id
 * @access owner_admin
 */
export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        await product.deleteOne();
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy toàn bộ món ăn được phân theo nhóm của một nhà hàng
 * @route GET /api/products/grouped/:restaurant_id
 * @access Public
 */
export const getProductsGroupedByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { restaurant_id } = req.params;

        const products = await Product.find({ restaurant_id }).populate("category_id", "name");

        // Khởi tạo một object để nhóm các món ăn theo danh mục
        const groupedProducts: Record<string, typeof products> = {};

        for (const product of products) {
            const categoryName = product.category_id ? (product.category_id as any).name : "Uncategorized";

            if (!groupedProducts[categoryName]) {
                groupedProducts[categoryName] = [];
            }

            groupedProducts[categoryName].push(product);
        }

        res.json(groupedProducts);
    } catch (error) {
        next(error);
    }
};

