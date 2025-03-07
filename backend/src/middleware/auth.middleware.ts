import { Request, Response, NextFunction } from "express";
import User from "../models/User.model";
import jwt from "jsonwebtoken";

import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

// khi nào chỉ cần xác thực thì dùng middleware này
// Middleware kiểm tra token và lấy user
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies?.access_token;
        if (!token) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { _id: string; role: string };
        const user = await User.findById(decoded._id).select("-password");
        if (!user) {
            res.status(401);
            throw new Error("User not found");
        }
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};


// Middleware xác thực + kiểm tra quyền truy cập dựa trên role
export const authorize = (allowedRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Xác thực người dùng (Authenticate)
        const token = req.cookies?.access_token;
        if (!token) {
            res.status(401);
            throw new Error("Unauthorized - No token provided");
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { _id: string };
        const user = await User.findById(decoded._id).select("-password");

        if (!user) {
            res.status(401);
            throw new Error("Unauthorized - User not found");
        }

        req.user = user;

        // Kiểm tra quyền hạn (Authorize)
        if (!allowedRoles.includes(user.role as string)) {
            res.status(403);
            throw new Error("Forbidden - You do not have permission");
        }

        next();
    } catch (error) {
        next(error);
    }

};
