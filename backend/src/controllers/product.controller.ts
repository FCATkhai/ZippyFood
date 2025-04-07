import { Request, Response, NextFunction } from "express";
import Product from "../models/Product.model";
import { deleteImage } from "../middleware/upload";
import { ICategory } from "~/shared/interface";

/**
 * Tạo món ăn mới
 * @route POST /api/products
 * @access owner
 */
export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { restaurant_id, name, description, tags, price, discount, category_id } = req.body;

        if (!restaurant_id || !name || !price || !category_id) {
            res.status(400);
            throw new Error("Restaurant ID, Name, Price, and Category ID are required");
        }

        //tag được nhận dạng mảng
        // const arrTags = JSON.parse(tags.replace(/^"|"$/g, ''));
        const arrTags = tags ? JSON.parse(tags) : [];
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
        res.status(201).json({ success: true, message: "Product created successfully", product });
    } catch (error) {
        await deleteImage(req.file?.path); // Xóa ảnh mới tải lên nếu có lỗi xảy ra
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

        res.json({ success: true, products});
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
            const categoryName = product.category_id ? (product.category_id as ICategory).name : "Uncategorized";

            if (!groupedProducts[categoryName]) {
                groupedProducts[categoryName] = [];
            }

            groupedProducts[categoryName].push(product);
        }

        res.json({success: true, groupedProducts});
    } catch (error) {
        next(error);
    }
};

/**
 * Cập nhật món ăn
 * @route PATCH /api/products/:id
 * @access owner
 */
export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, tags, price, discount, status, category_id } = req.body;
        const arrTags = tags ? JSON.parse(tags) : [];
        const imageUrl = req.file?.path;

        const product = await Product.findById(id);
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        if (imageUrl) {
            deleteImage(product.image); // Xóa ảnh cũ nếu có
        }

        if (name) product.name = name;
        if (description) product.description = description;
        if (arrTags) product.tags = arrTags;
        if (imageUrl) product.image = imageUrl;
        if (price) product.price = price;
        if (discount) product.discount = discount;
        if (status) product.status = status;
        if (category_id) product.category_id = category_id;

        await product.save();
        res.json({ success: true, message: "Product updated successfully", product });
    } catch (error) {
        await deleteImage(req.file?.path); // Xóa ảnh mới tải lên nếu có lỗi xảy ra

        next(error);
    }
};

/**
 * Xóa món ăn
 * @route DELETE /api/products/:id
 * @access owner
 */
export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }
        await deleteImage(product.image); // Xóa ảnh liên quan đến món ăn

        await product.deleteOne();
        res.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        next(error);
    }
};



