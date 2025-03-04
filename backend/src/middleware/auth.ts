// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// import dotenv from 'dotenv';
// dotenv.config();

// exports.protect = async (req, res, next) => {
//     const token = req.headers.authorization;

//     if (!token) return res.status(401).json({ message: 'Unauthorized' });

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = await User.findById(decoded.id).select('-password');
//         next();
//     } catch (error) {
//         res.status(401).json({ message: 'Invalid token' });
//     }
// };


// Xác thực JWT
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const User = require("../models/User");

interface CustomRequest extends Request {
    user?: any;
}

export const protect = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = await User.findById(decoded.id).select("-password");
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};
