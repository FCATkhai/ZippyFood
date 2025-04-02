import { NextFunction, Request, Response } from 'express';
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

        // Tạo user mới
        const newUser = new User({
            name,
            email,
            password,
            phone,
            addresses: [],
            role: role || "customer", // Mặc định là "customer"
        });

        await newUser.save();

        res.status(201).json({ success: true, message: "User created successfully", user: newUser });
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
        const isMatch = await user.comparePassword(password);
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
            success: true,
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
        res.clearCookie("access_token");
        res.json({ success: true, message: "Logged out successfully" });
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

        res.json({ success: true, message: "User upgraded to restaurant owner successfully", user });
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
 *  @route PUT/PATCH /api/users/:id
 *  @access All users (Only owner or admin)
 */
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, email, phone } = req.body;

        // Kiểm tra user tồn tại
        const user = await User.findById(id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        // Kiểm tra quyền: user chỉ được sửa chính mình hoặc admin
        if (req.user?._id.toString() !== id && req.user?.role !== USER_ROLES.ADMIN) {
            res.status(403);
            throw new Error("You are not authorized to update this user");
        }

        // Cập nhật các field (chỉ cho phép ["name", "email", "phone"])
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (phone !== undefined) user.phone = phone;

        await user.save();

        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

/**
 *  Thay đổi mật khẩu
 *  @route PATCH /api/users/:id/change-password
 *  @access All users (Only owner)
 */
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;

        // Kiểm tra user tồn tại
        const user = await User.findById(id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        // Chỉ cho phép user đổi mật khẩu chính mình
        if (req.user?._id.toString() !== id) {
            res.status(403);
            throw new Error("You can only change your own password");
        }

        // Kiểm tra mật khẩu cũ
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            res.status(400);
            throw new Error("Old password is incorrect");
        }

        // Cập nhật mật khẩu mới
        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
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


//--------- address route -----------

/**
 * Thêm địa chỉ mới cho user
 * @route POST /api/users/:id/addresses
 * @access Only owner or admin
 */
export const addAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { address } = req.body;

        if (!address) {
            res.status(400);
            throw new Error("Address is required");
        }

        // Kiểm tra user tồn tại
        const user = await User.findById(id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        // Kiểm tra quyền
        if (req.user?._id.toString() !== id && req.user?.role !== USER_ROLES.ADMIN) {
            res.status(403);
            throw new Error("You are not authorized to update this user");
        }

        user.addresses.push(address);
        await user.save();

        res.json({ success: true, message: "Address added", addresses: user.addresses });
    } catch (error) {
        next(error);
    }
};

/**
 * Cập nhật địa chỉ của user
 * @route PUT /api/users/:id/addresses/:index
 * @access Only owner or admin
 */
export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, index } = req.params;
        const { address } = req.body;

        if (!address) {
            res.status(400);
            throw new Error("Address is required");
        }

        // Kiểm tra user tồn tại
        const user = await User.findById(id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        // Kiểm tra quyền
        if (req.user?._id.toString() !== id && req.user?.role !== USER_ROLES.ADMIN) {
            res.status(403);
            throw new Error("You are not authorized to update this user");
        }

        const idx = parseInt(index);
        if (idx < 0 || idx >= user.addresses.length) {
            res.status(400);
            throw new Error("Invalid address index");
        }

        user.addresses[idx] = address;
        await user.save();

        res.json({ success: true, message: "Address updated", addresses: user.addresses });
    } catch (error) {
        next(error);
    }
};

/**
 * Xóa địa chỉ của user
 * @route DELETE /api/users/:id/addresses/:index
 * @access Only owner or admin
 */
export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, index } = req.params;

        // Kiểm tra user tồn tại
        const user = await User.findById(id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        // Kiểm tra quyền
        if (req.user?._id.toString() !== id && req.user?.role !== USER_ROLES.ADMIN) {
            res.status(403);
            throw new Error("You are not authorized to update this user");
        }

        const idx = parseInt(index);
        if (idx < 0 || idx >= user.addresses.length) {
            res.status(400);
            throw new Error("Invalid address index");
        }

        user.addresses.splice(idx, 1);
        await user.save();

        res.json({ success: true, message: "Address deleted", addresses: user.addresses });
    } catch (error) {
        next(error);
    }
};

