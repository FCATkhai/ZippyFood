import Order from '../models/Order.model';
import Product from '../models/Product.model';
import Restaurant from '../models/Restaurant.model';
import User from '../models/User.model';
import MerchantReport from '../models/MerchantReport.model';
import AdminReport from '../models/AdminReport.model';
import type {
    IAdminReport,
    IMerchantReport,
    IOrder,
    IProduct,
    IRestaurant,
    ITopProduct,
    ITopProductAdmin,
    IUser,
} from '~/shared/interface'
import getDateRange from '../utils/dateRange';
import { Model, Types,} from 'mongoose';

interface IReportData {
    completed_orders: number;
    revenue: number;
    top_products: ITopProduct[];
}

interface IAdminReportData {
    total_orders: number;
    total_revenue: number;
    top_products: ITopProductAdmin[];
}

// Service class for report-related logic
class ReportService {
    private orderModel: Model<IOrder>;
    private productModel: Model<IProduct>;
    private restaurantModel: Model<IRestaurant>;
    private userModel: Model<IUser>;
    private merchantReportModel: Model<IMerchantReport>;
    private adminReportModel: Model<IAdminReport>;

    constructor() {
        this.orderModel = Order;
        this.productModel = Product;
        this.restaurantModel = Restaurant;
        this.userModel = User;
        this.merchantReportModel = MerchantReport;
        this.adminReportModel = AdminReport;
    }

    /**
     * Get merchant stats (daily and monthly) for a specific restaurant
     * @param restaurant_id Restaurant ID
     * @returns Daily and monthly stats
     * @throws Error if stats cannot be retrieved or saved
     */
    async getMerchantStats(restaurant_id: Types.ObjectId): Promise<{
        daily: IReportData;
        monthly: IReportData;
    }> {
        try {
            const dailyRange = getDateRange('daily');
            const monthlyRange = getDateRange('monthly');

            // Daily orders and revenue
            const dailyOrderStats = await this.orderModel.aggregate([
                {
                    $match: {
                        restaurant_id,
                        status: 'completed',
                        completed_at: {
                            $gte: dailyRange.startDate,
                            $lte: dailyRange.endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: '$total_price' }
                    }
                }
            ]);

            const dailyOrders = dailyOrderStats[0]?.totalOrders || 0;
            const dailyRevenue = dailyOrderStats[0]?.totalRevenue || 0;

            // Monthly orders and revenue
            const monthlyOrderStats = await this.orderModel.aggregate([
                {
                    $match: {
                        restaurant_id,
                        status: 'completed',
                        completed_at: {
                            $gte: monthlyRange.startDate,
                            $lte: monthlyRange.endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: '$total_price' }
                    }
                }
            ]);

            const monthlyOrders = monthlyOrderStats[0]?.totalOrders || 0;
            const monthlyRevenue = monthlyOrderStats[0]?.totalRevenue || 0;

            // Daily top-selling products
            const dailyTopProducts = await this.productModel.aggregate([
                {
                    $match: {
                        restaurant_id,
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
                                            { $lte: ['$completed_at', dailyRange.endDate] },
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
                        product_id: '$_id',
                        name: 1,
                        totalSold: { $ifNull: ['$sales.totalSold', 0] }
                    }
                },
                { $sort: { totalSold: -1 } },
                { $limit: 5 }
            ]);

            // Monthly top-selling products
            const monthlyTopProducts = await this.productModel.aggregate([
                {
                    $match: {
                        restaurant_id,
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
                                            { $gte: ['$completed_at', monthlyRange.startDate] },
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
                        product_id: '$_id',
                        name: 1,
                        totalSold: { $ifNull: ['$sales.totalSold', 0] }
                    }
                },
                { $sort: { totalSold: -1 } },
                { $limit: 5 }
            ]);

            // Save reports
            await this.merchantReportModel.findOneAndUpdate(
                { restaurant_id, period: 'daily', report_date: dailyRange.startDate },
                {
                    restaurant_id,
                    period: 'daily',
                    report_date: dailyRange.startDate,
                    completed_orders: dailyOrders,
                    revenue: dailyRevenue,
                    top_products: dailyTopProducts
                },
                { upsert: true }
            );

            await this.merchantReportModel.findOneAndUpdate(
                { restaurant_id, period: 'monthly', report_date: monthlyRange.startDate },
                {
                    restaurant_id,
                    period: 'monthly',
                    report_date: monthlyRange.startDate,
                    completed_orders: monthlyOrders,
                    revenue: monthlyRevenue,
                    top_products: monthlyTopProducts
                },
                { upsert: true }
            );

            return {
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
            };
        } catch (error) {
            throw new Error(`Không thể lấy thống kê merchant: ${(error as Error).message}`);
        }
    }

    /**
     * Get admin stats (daily and monthly) for the platform
     * @returns Daily and monthly stats
     * @throws Error if stats cannot be retrieved or saved
     */
    async getAdminStats(): Promise<{
        daily: IAdminReportData;
        monthly: IAdminReportData;
    }> {
        try {
            const dailyRange = getDateRange('daily');
            const monthlyRange = getDateRange('monthly');

            // Daily orders and revenue
            const dailyOrderStats = await this.orderModel.aggregate([
                {
                    $match: {
                        status: 'completed',
                        completed_at: {
                            $gte: dailyRange.startDate,
                            $lte: dailyRange.endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: '$total_price' }
                    }
                }
            ]);

            const dailyOrders = dailyOrderStats[0]?.totalOrders || 0;
            const dailyRevenue = dailyOrderStats[0]?.totalRevenue || 0;

            // Monthly orders and revenue
            const monthlyOrderStats = await this.orderModel.aggregate([
                {
                    $match: {
                        status: 'completed',
                        completed_at: {
                            $gte: monthlyRange.startDate,
                            $lte: monthlyRange.endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: '$total_price' }
                    }
                }
            ]);

            const monthlyOrders = monthlyOrderStats[0]?.totalOrders || 0;
            const monthlyRevenue = monthlyOrderStats[0]?.totalRevenue || 0;

            // Daily top-selling products
            const dailyTopProducts = await this.productModel.aggregate([
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
                                            { $lte: ['$completed_at', dailyRange.endDate] },
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
                        product_id: '$_id',
                        name: 1,
                        totalSold: { $ifNull: ['$sales.totalSold', 0] },
                        restaurant_id: '$restaurant._id'
                    }
                },
                { $sort: { totalSold: -1 } },
                { $limit: 5 }
            ]);

            // Monthly top-selling products
            const monthlyTopProducts = await this.productModel.aggregate([
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
                                            { $gte: ['$completed_at', monthlyRange.startDate] },
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
                        product_id: '$_id',
                        name: 1,
                        totalSold: { $ifNull: ['$sales.totalSold', 0] },
                        restaurant_id: '$restaurant._id'
                    }
                },
                { $sort: { totalSold: -1 } },
                { $limit: 5 }
            ]);

            const totalUsers = await this.userModel.countDocuments();
            const totalRestaurants = await this.restaurantModel.countDocuments();

            await this.adminReportModel.findOneAndUpdate(
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

            await this.adminReportModel.findOneAndUpdate(
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

            return {
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
            };
        } catch (error) {
            throw new Error(`Không thể lấy thống kê admin: ${(error as Error).message}`);
        }
    }
}

export default new ReportService();