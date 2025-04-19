import { Request, Response, NextFunction } from "express";
import { IAdminReport, IUser } from "~/shared/interface";
import Restaurant from "../../models/Restaurant.model";
import AdminReport from "../../models/AdminReport.model";
import User from "../../models/User.model";
import { FilterQuery } from "mongoose";
import { USER_ROLES } from "../../config/constants";
import { RESTAURANT_STATUSES } from "~/shared/constant";
import ReportService from "../../services/report.service";
/**
 * Get and save admin statistics
 * @route GET /api/stats/admin
 * @access Private (admin)
 */
export const getAdminStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user as IUser;
        if (!user || user.role !== USER_ROLES.ADMIN) {
            res.status(403);
            throw new Error('Unauthorized: Only admins can access this endpoint');
        }

        const stats = await ReportService.getAdminStats();

        res.status(200).json({
            success: true,
            message: 'Admin stats retrieved successfully',
            daily: stats.daily,
            monthly: stats.monthly
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current admin statistics (opening restaurants, total users, total restaurants)
 * @route GET /api/stats/admin/current
 * @access Private (admin)
 */
export const getAdminCurrentStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user as IUser;
        if (!user || user.role !== USER_ROLES.ADMIN) {
            res.status(403);
            throw new Error('Unauthorized: Only admins can access this endpoint');
        }

        const openingRestaurants = await Restaurant.countDocuments({
            status: RESTAURANT_STATUSES.OPENING
        });

        const totalUsers = await User.countDocuments();
        const totalRestaurants = await Restaurant.countDocuments();

        res.status(200).json({
            success: true,
            opening_restaurants: openingRestaurants,
            total_users: totalUsers,
            total_restaurants: totalRestaurants
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get historical admin reports
 * @route GET /api/stats/admin/history
 * @access Private (admin)
 */
export const getAdminReportHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user as IUser;
        if (!user || user.role !== USER_ROLES.ADMIN) {
            res.status(403);
            throw new Error('Unauthorized: Only admins can access this endpoint');
        }

        // eslint-disable-next-line prefer-const
        let { start_date, end_date, period, page = 1, limit = 10 } = req.query;
        page = Number(page);
        limit = Number(limit);

        const query: FilterQuery<IAdminReport> = {};
        if (period) {
            query.period = period;
        }
        if (start_date && end_date) {
            query.report_date = {
                $gte: new Date(start_date as string),
                $lte: new Date(end_date as string)
            };
        }

        const total = await AdminReport.countDocuments(query);
        const reports = await AdminReport.find(query)
            .sort({ report_date: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            success: true,
            total,
            page,
            limit,
            total_pages: Math.ceil(total / limit),
            data: reports
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete all today admin reports
 * @route DELETE /api/stats/admin/today
 * @access Private (admin)
 */
export const deleteTodayAdminReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user as IUser;
        if (!user || user.role !== 'admin') {
            res.status(403);
            throw new Error('Unauthorized: Only admins can access this endpoint');
        }

        // Get today's date range
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // Delete today's admin reports
        const result = await AdminReport.deleteMany({
            report_date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        res.status(200).json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} admin reports for today`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete all admin reports
 * @route DELETE /api/stats/admin/all
 * @access Private (admin)
 */
export const deleteAllAdminReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user as IUser;
        if (!user || user.role !== 'admin') {
            res.status(403);
            throw new Error('Unauthorized: Only admins can access this endpoint');
        }

        // Delete all daily and monthly admin reports
        const result = await AdminReport.deleteMany({});


        res.status(200).json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} admin reports`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        next(error);
    }
};