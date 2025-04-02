import { Request, Response, NextFunction } from "express";
import Category from "../models/Category.model";

/**
 * Tạo danh mục món ăn
 * @route POST /api/categories
 * @access owner_admin
 */
export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { restaurant_id, name, description } = req.body;

        if (!restaurant_id || !name) {
            res.status(400);
            throw new Error("Restaurant ID and name are required");
        }

        const category = new Category({ restaurant_id, name, description });
        await category.save();

        res.status(201).json({success: true, message: "Category created successfully", category });
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy danh sách danh mục của một nhà hàng
 * @route GET /api/categories/:restaurant_id
 * @access Public
 */
export const getCategoriesByRestaurant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { restaurant_id } = req.params;
        const categories = await Category.find({ restaurant_id });

        res.json(categories);
    } catch (error) {
        next(error);
    }
};

/**
 * Cập nhật danh mục món ăn
 * @route PUT/PATCH /api/categories/:id
 * @access owner_admin
 */
export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const category = await Category.findById(id);
        if (!category) {
            res.status(404);
            throw new Error("Category not found");
        }

        Object.assign(category, updateData);

        await category.save();

        res.json({success: true, message: "Category updated successfully", category });
    } catch (error) {
        next(error);
    }
};

/**
 * Xoá danh mục món ăn
 * @route DELETE /api/categories/:id
 * @access owner_admin
 */
export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            res.status(404);
            throw new Error("Category not found");
        }

        await category.deleteOne();
        res.json({success: true, message: "Category deleted successfully" });
    } catch (error) {
        next(error);
    }
};
