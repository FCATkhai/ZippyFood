import { Request, Response, NextFunction } from "express";
import { IAdminReport, IUser } from "~/shared/interface";
import Restaurant from "../models/Restaurant.model";
import Order from "../models/Order.model";
import getDateRange from "../utils/dateRange";
import Product from "../models/Product.model";
import AdminReport from "../models/AdminReport.model";
import User from "../models/User.model";
import { FilterQuery } from "mongoose";
import { USER_ROLES } from "../config/constants";

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

        const dailyRange = getDateRange('daily');
        const monthlyRange = getDateRange('monthly');

        // Total orders and revenue
        const orderStats = await Order.aggregate([
            {
                $match: {
                    status: 'completed',
                    completed_at: {
                        $gte: dailyRange.startDate,
                        $lte: monthlyRange.endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        period: {
                            $cond: {
                                if: { $lte: ['$completed_at', dailyRange.endDate] },
                                then: 'daily',
                                else: 'monthly'
                            }
                        }
                    },
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$total_price' }
                }
            }
        ]);

        const dailyOrders = orderStats.find(stat => stat._id.period === 'daily')?.totalOrders || 0;
        const dailyRevenue = orderStats.find(stat => stat._id.period === 'daily')?.totalRevenue || 0;
        const monthlyOrders = orderStats.find(stat => stat._id.period === 'monthly')?.totalOrders || 0;
        const monthlyRevenue = orderStats.find(stat => stat._id.period === 'monthly')?.totalRevenue || 0;

        // Top-selling products
        const topProducts = await Product.aggregate([
            {
                $match: {
                    sales_count: { $gt: 0 }
                }
            },
            {
                $lookup: {
                    from: 'restaurants',
                    localField: 'restaurant_id',
                    foreignField: '_id',
                    as: 'restaurant'
                }
            },
            { $unwind: '$restaurant' },
            {
                $lookup: {
                    from: 'orders',
                    let: { productId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$status', 'completed'] },
                                        { $gte: ['$completed_at', dailyRange.startDate] },
                                        { $lte: ['$completed_at', monthlyRange.endDate] },
                                        { $in: ['$$productId', '$products.product_id'] }
                                    ]
                                }
                            }
                        },
                        { $unwind: '$products' },
                        {
                            $match: { $expr: { $eq: ['$products.product_id', '$$productId'] } }
                        },
                        {
                            $group: {
                                _id: null,
                                totalSold: { $sum: '$products.quantity' }
                            }
                        }
                    ],
                    as: 'sales'
                }
            },
            {
                $unwind: { path: '$sales', preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    totalSold: { $ifNull: ['$sales.totalSold', 0] },
                    restaurant_id: '$restaurant._id',
                    period: {
                        $cond: {
                            if: { $lte: ['$sales.completed_at', dailyRange.endDate] },
                            then: 'daily',
                            else: 'monthly'
                        }
                    }
                }
            },
            {
                $sort: { totalSold: -1 }
            },
            {
                $group: {
                    _id: '$period',
                    products: {
                        $push: {
                            product_id: '$_id',
                            name: '$name',
                            totalSold: '$totalSold',
                            restaurant_id: '$restaurant_id'
                        }
                    }
                }
            },
            {
                $project: {
                    products: { $slice: ['$products', 5] }
                }
            }
        ]);

        const dailyTopProducts = topProducts.find(p => p._id === 'daily')?.products || [];
        const monthlyTopProducts = topProducts.find(p => p._id === 'monthly')?.products || [];

        // Total users and restaurants (for monthly report only)
        const totalUsers = await User.countDocuments();
        const totalRestaurants = await Restaurant.countDocuments();

        // Save reports
        await AdminReport.findOneAndUpdate(
            { period: 'daily', report_date: dailyRange.startDate },
            {
                period: 'daily',
                report_date: dailyRange.startDate,
                total_orders: dailyOrders,
                total_revenue: dailyRevenue,
                top_products: dailyTopProducts
            },
            { upsert: true }
        );

        await AdminReport.findOneAndUpdate(
            { period: 'monthly', report_date: monthlyRange.startDate },
            {
                period: 'monthly',
                report_date: monthlyRange.startDate,
                total_orders: monthlyOrders,
                total_revenue: monthlyRevenue,
                top_products: monthlyTopProducts,
                total_users: totalUsers,
                total_restaurants: totalRestaurants
            },
            { upsert: true }
        );

        res.status(200).json({
            daily: {
                total_orders: dailyOrders,
                total_revenue: dailyRevenue,
                top_products: dailyTopProducts
            },
            monthly: {
                total_orders: monthlyOrders,
                total_revenue: monthlyRevenue,
                top_products: monthlyTopProducts
            }
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

        const now = new Date();
        const currentDay = now.toLocaleString('en-US', { weekday: 'long' });
        const currentTime = now.toTimeString().slice(0, 5);

        const openingRestaurants = await Restaurant.countDocuments({
            open_hours: {
                $elemMatch: {
                    day: currentDay,
                    time_slots: {
                        $elemMatch: {
                            start: { $lte: currentTime },
                            end: { $gte: currentTime }
                        }
                    }
                }
            }
        });

        const totalUsers = await User.countDocuments();
        const totalRestaurants = await Restaurant.countDocuments();

        res.status(200).json({
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