import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { USER_ROLES } from '../config/constants';

import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.model';

/**
 *  Đăng ký tài khoản
 *  @route POST /api/users
 *  @access Public
 */
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, password, phone, role } = req.body;

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400);
            throw new Error("Email already exists");
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role: role || "customer", // Mặc định là "customer"
        });

        await newUser.save();

        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error: unknown) {
        next(error);
    }
};

/**
 *  Đăng nhập
 *  @route POST /api/users/login
 *  @access Public
 */
export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Kiểm tra user có tồn tại không
        const user = await User.findOne({ email });
        if (!user) {
            res.status(401);
            throw new Error("Invalid email or password");
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401);
            throw new Error("Invalid email or password");
        }
        // Tạo JWT token
        const token = jwt.sign(
            { _id: user._id, role: user.role }, 
            process.env.JWT_SECRET as jwt.Secret, 
            { expiresIn: process.env.JWT_EXPIRES_IN } as jwt.SignOptions);

        // Lưu token vào cookie
        res.cookie("access_token", token, {
            httpOnly: true, // Chỉ gửi token qua HTTP(S)
            secure: process.env.NODE_ENV === "production", // Chỉ bật secure mode khi production
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        });

        res.json({
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error: unknown) {
        next(error);
    }
};

/**
 *  Đăng xuất
 *  @route POST /api/users/logout
 *  @access All users
 */
export const logoutUser = (req: Request, res: Response, next: NextFunction) => {
    try {
        res.cookie("access_token", "", {
            httpOnly: true,
            expires: new Date(0), // Cookie hết hạn ngay lập tức
            sameSite: "lax",
        });
    
        res.json({ message: "Logged out successfully" });
    } catch (error: unknown) {
        next(error);
    }
};

/**
 *  Nâng hạng từ customer lên restaurant owner
 *  @route POST /api/users/upgrade
 *  @access customer_admin
 */
export const upgradeToRestaurantOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?._id; // Lấy userId từ middleware xác thực
        if (!userId) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }
        
        if (user.role === USER_ROLES.RESTAURANT_OWNER) {
            res.status(400);
            throw new Error("User is already a restaurant owner");
        }

        user.role = USER_ROLES.RESTAURANT_OWNER;
        await user.save();

        res.json({ message: "User upgraded to restaurant owner successfully", user });
    } catch (error) {
        next(error);
    }
};

/**
 *  Lấy danh sách tất cả user
 *  @route GET /api/users/
 *  @access admin
 */
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.find();
        res.json({ success: true, users });
    } catch (error: unknown) {
        next(error);
    }
};

// Lấy thông tin 1 user theo ID
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        res.json({ success: true, user });
    } catch (error: unknown) {
        next(error);
    }
};

/**
 *  Cập nhật thông tin user
 *  @route PUT /api/users/:id
 *  @access All users
 */
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) {
            res.status(404);
            throw new Error("User not found");
        }

        res.json({ success: true, user: updatedUser });
    } catch (error: unknown) {
        next(error);
    }
};

/**
 *  Xoá user
 *  @route DELETE /api/users/:id
 *  @access admin
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            res.status(404);
            throw new Error("User not found");
        }

        res.json({ success: true, message: 'User deleted' });
    } catch (error: unknown) {
        next(error);
    }
};
