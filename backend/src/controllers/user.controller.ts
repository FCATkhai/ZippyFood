/* eslint-disable prefer-const */
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { USER_ROLES } from '../config/constants';

import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.model';
import { FilterQuery, SortOrder } from 'mongoose';

/**
 *  Đăng ký tài khoản
 *  @route POST /api/users/register
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
                role: user.role,
                addresses: user.addresses,
                phone: user.phone,
                status: user.status,
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
 *  Đổi vai trò của user
 *  @route PATCH /api/users/change-role
 *  @access admin
 */
export const changeUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // const userId = req.user?._id; // Lấy userId từ middleware xác thực
        const { id, role } = req.body;
        console.log(id);

        const user = await User.findById(id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        if (req.user.role !== USER_ROLES.ADMIN) {
            res.status(403);
            throw new Error("You cannot change user's role");
        }

        //TODO: Cài đặt tạm thời để không thể đổi quyền admin sang các quyền khác
        if (user.role !== USER_ROLES.ADMIN) {
            user.role = role;
            await user.save();
        }


        //TODO: Code hoàn chỉnh
        // user.role = role;        
        // await user.save();


        res.json({ success: true, message: "Change user role successfully", user });
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy danh sách tất cả user
 * @route GET /api/users/
 * @access admin
 */
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let {
            page = 1,
            limit = 10,
            search = "",
            role = "",
            sort = "desc" // Default sort descending
        } = req.query;

        page = Number(page);
        limit = Number(limit);
        const query: FilterQuery<unknown> = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } }
            ];
        }

        // Add role filter
        if (role && ['customer', 'restaurant_owner', 'admin'].includes(role as string)) {
            query.role = role;
        }

        const total = await User.countDocuments(query);

        const sortOption: { [key: string]: SortOrder } = { createdAt: sort === "desc" ? -1 : 1 };

        const userList = await User.find(query)
            .select("-password")
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(limit);

        const hasMore = page * limit < total;

        res.status(200).json({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasMore,
            data: userList
        });
    } catch (error) {
        next(error);
    }
};

// Lấy thông tin 1 user theo ID
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
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

// Middleware để kiểm tra quyền truy cập của người dùng
const ensureAuthorizedUser = async (req: Request, res: Response, userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    if (req.user?._id.toString() !== userId && req.user?.role !== USER_ROLES.ADMIN) {
        res.status(403);
        throw new Error("You are not authorized to update this user");
    }
    return user;
};

/**
 * Thêm địa chỉ mới cho user
 * @route POST /api/users/:id/addresses
 * @access Only owner or admin
 */
export const addAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { address } = req.body;

        if (!address || typeof address !== "string" || address.trim() === "") {
            res.status(400);
            throw new Error("Address is required");
        }

        const user = await ensureAuthorizedUser(req, res, id);
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

        if (!address || typeof address !== "string" || address.trim() === "") {
            res.status(400);
            throw new Error("Address is required");
        }

        const user = await ensureAuthorizedUser(req, res, id);

        const idx = parseInt(index, 10);
        if (isNaN(idx) || idx < 0 || idx >= user.addresses.length) {
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

        const user = await ensureAuthorizedUser(req, res, id);

        const idx = parseInt(index, 10);
        if (isNaN(idx) || idx < 0 || idx >= user.addresses.length) {
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

