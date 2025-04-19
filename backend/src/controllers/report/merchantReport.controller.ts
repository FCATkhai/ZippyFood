import { Request, Response, NextFunction } from "express";
import { IMerchantReport, IUser } from "~/shared/interface";
import Restaurant from "../../models/Restaurant.model";
import Order from "../../models/Order.model";
import Product from "../../models/Product.model";
import MerchantReport from "../../models/MerchantReport.model";
import { FilterQuery, Types } from "mongoose";
import { USER_ROLES } from "../../config/constants";
import ReportService from "../../services/report.service";
/**
 * Get and save merchant statistics
 * @route GET /api/stats/merchant/:restaurant_id
 * @access Private (restaurant_owner)
 */
export const getMerchantStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user as IUser;
        const {restaurant_id} = req.params;
        if (!user || (user.role !== USER_ROLES.RESTAURANT_OWNER && user.role !== USER_ROLES.ADMIN)) {
            res.status(403);
            throw new Error('Unauthorized');
        }

        const restaurant = await Restaurant.findOne({ _id: new Types.ObjectId(restaurant_id) });
        if (!restaurant) {
            res.status(404);
            throw new Error('Restaurant not found');
        }

        const stats = await ReportService.getMerchantStats(restaurant._id);


        res.status(200).json({
            success: true,
            message: 'Merchant stats retrieved successfully',
            daily: stats.daily,
            monthly: stats.monthly
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current merchant statistics (pending orders, total products)
 * @route GET /api/stats/merchant/current/:restaurant_id
 * @access Private (restaurant_owner)
 */
export const getMerchantCurrentStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user as IUser;
        if (!user || (user.role !== USER_ROLES.RESTAURANT_OWNER && user.role !== USER_ROLES.ADMIN)) {
            res.status(403);
            throw new Error('Unauthorized');
        }
        const {restaurant_id} = req.params;
        const restaurant = await Restaurant.findOne({ _id: new Types.ObjectId(restaurant_id) });
        if (!restaurant) {
            res.status(404);
            throw new Error('Restaurant not found');
        }

        const pendingOrders = await Order.countDocuments({
            restaurant_id: restaurant._id,
            status: 'pending'
        });

        const totalProducts = await Product.countDocuments({
            restaurant_id: restaurant._id
        });

        res.status(200).json({
            success: true,
            pending_orders: pendingOrders,
            total_products: totalProducts
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get historical merchant reports
 * @route GET /api/stats/merchant/history/:restaurant_id
 * @access Private (restaurant_owner)
 */
export const getMerchantReportHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user as IUser;
        if (!user || (user.role !== USER_ROLES.RESTAURANT_OWNER && user.role !== USER_ROLES.ADMIN)) {
            res.status(403);
            throw new Error('Unauthorized');
        }

        const { restaurant_id } = req.params;
        const restaurant = await Restaurant.findById(new Types.ObjectId(restaurant_id));
        if (!restaurant) {
            res.status(404);
            throw new Error('Restaurant not found');
        }

        // eslint-disable-next-line prefer-const
        let { start_date, end_date, period, page = 1, limit = 10 } = req.query;
        page = Number(page);
        limit = Number(limit);

        const query: FilterQuery<IMerchantReport> = { restaurant_id: restaurant._id };
        if (period) {
            query.period = period;
        }
        if (start_date && end_date) {
            query.report_date = {
                $gte: new Date(start_date as string),
                $lte: new Date(end_date as string)
            };
        }

        const total = await MerchantReport.countDocuments(query);
        const reports = await MerchantReport.find(query)
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

//--------------------------------------------------------------------
/**
 * Delete today merchant reports
 * @route DELETE /api/stats/merchant/today/:restaurant_id
 * @access owner-admin
 */
export const deleteTodayMerchantReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user as IUser;
        const restaurant_id = new Types.ObjectId(req.params.restaurant_id);

        // Authorization check
        if (user.role !== 'admin') {
            const restaurant = await Restaurant.findOne({ owner_id: user._id, _id: restaurant_id });
            if (!restaurant) {
                res.status(403);
                throw new Error('Unauthorized: You do not own this restaurant');
            }
        }

        // Get today's date range
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // Delete today's merchant reports
        const result = await MerchantReport.deleteMany({
            restaurant_id,
            report_date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });


        res.status(200).json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} merchant reports for today`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete all admin reports
 * @route DELETE /api/stats/merchant/all/:restaurant_id
 * @access owner-admin
 */
export const deleteAllMerchantReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user as IUser;
        const restaurant_id = new Types.ObjectId(req.params.restaurant_id);

        // Authorization check
        if (user.role !== 'admin') {
            const restaurant = await Restaurant.findOne({ owner_id: user._id, _id: restaurant_id });
            if (!restaurant) {
                res.status(403);
                throw new Error('Unauthorized: You do not own this restaurant');
            }
        }

        // Delete all daily and monthly merchant reports for the restaurant
        const result = await MerchantReport.deleteMany({
            restaurant_id
        });


        res.status(200).json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} merchant reports`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAllReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Delete all daily and monthly merchant reports for the restaurant
        const result = await MerchantReport.deleteMany({});

        res.status(200).json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} merchant reports`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        next(error);
    }
}