import { Request, Response, NextFunction } from "express";
import { IMerchantReport, IUser } from "~/shared/interface";
import Restaurant from "../models/Restaurant.model";
import Order from "../models/Order.model";
import getDateRange from "../utils/dateRange";
import Product from "../models/Product.model";
import MerchantReport from "../models/MerchantReport.model";
import { FilterQuery } from "mongoose";
import { USER_ROLES } from "../config/constants";
/**
 * Get and save merchant statistics
 * @route GET /api/stats/merchant
 * @access Private (restaurant_owner)
 */
export const getMerchantStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user as IUser;
        if (!user || user.role !== USER_ROLES.RESTAURANT_OWNER) {
            res.status(403);
            throw new Error('Unauthorized: Only restaurant owners can access this endpoint');
        }

        const restaurant = await Restaurant.findOne({ owner_id: user._id });
        if (!restaurant) {
            res.status(404);
            throw new Error('Restaurant not found');
        }

        const dailyRange = getDateRange('daily');
        const monthlyRange = getDateRange('monthly');

        // Completed orders and revenue
        const orderStats = await Order.aggregate([
            {
                $match: {
                    restaurant_id: restaurant._id,
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
                    restaurant_id: restaurant._id,
                    sales_count: { $gt: 0 }
                }
            },
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
                            totalSold: '$totalSold'
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

        // Save reports
        await MerchantReport.findOneAndUpdate(
            { restaurant_id: restaurant._id, period: 'daily', report_date: dailyRange.startDate },
            {
                restaurant_id: restaurant._id,
                period: 'daily',
                report_date: dailyRange.startDate,
                completed_orders: dailyOrders,
                revenue: dailyRevenue,
                top_products: dailyTopProducts
            },
            { upsert: true }
        );

        await MerchantReport.findOneAndUpdate(
            { restaurant_id: restaurant._id, period: 'monthly', report_date: monthlyRange.startDate },
            {
                restaurant_id: restaurant._id,
                period: 'monthly',
                report_date: monthlyRange.startDate,
                completed_orders: monthlyOrders,
                revenue: monthlyRevenue,
                top_products: monthlyTopProducts
            },
            { upsert: true }
        );

        res.status(200).json({
            daily: {
                completed_orders: dailyOrders,
                revenue: dailyRevenue,
                top_products: dailyTopProducts
            },
            monthly: {
                completed_orders: monthlyOrders,
                revenue: monthlyRevenue,
                top_products: monthlyTopProducts
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current merchant statistics (pending orders, total products)
 * @route GET /api/stats/merchant/current
 * @access Private (restaurant_owner)
 */
export const getMerchantCurrentStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user as IUser;
        if (!user || user.role !== USER_ROLES.RESTAURANT_OWNER) {
            res.status(403);
            throw new Error('Unauthorized: Only restaurant owners can access this endpoint');
        }

        const restaurant = await Restaurant.findOne({ owner_id: user._id });
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
            pending_orders: pendingOrders,
            total_products: totalProducts
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get historical merchant reports
 * @route GET /api/stats/merchant/history
 * @access Private (restaurant_owner)
 */
export const getMerchantReportHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user as IUser;
        if (!user || user.role !== USER_ROLES.RESTAURANT_OWNER) {
            res.status(403);
            throw new Error('Unauthorized: Only restaurant owners can access this endpoint');
        }

        const restaurant = await Restaurant.findOne({ owner_id: user._id });
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