import type { ITopProduct, ITopProductAdmin } from "~/shared/interface";

// Interface for daily/monthly report data
export interface IReportData {
    completed_orders: number;
    revenue: number;
    top_products: ITopProduct[];
}

export interface IAdminReportData {
    total_orders: number;
    total_revenue: number;
    top_products: ITopProductAdmin[];
}

// Interface for merchant stats response
export interface IMerchantStatsResponse {
    success: boolean;
    message?: string;
    daily: IReportData;
    monthly: IReportData;
}

// Interface for merchant current stats response
export interface IMerchantCurrentStatsResponse {
    success: boolean;
    message?: string;
    pending_orders: number;
    total_products: number;
}

// Interface for admin stats response
export interface IAdminStatsResponse {
    success: boolean;
    message?: string;
    daily: IAdminReportData;
    monthly: IAdminReportData;
}

// Interface for admin current stats response
export interface IAdminCurrentStatsResponse {
    success: boolean;
    message?: string;
    opening_restaurants: number;
    total_users: number;
    total_restaurants: number;
}

// Interface for historical report query parameters
export interface IReportHistoryQuery {
    start_date?: string;
    end_date?: string;
    period?: 'daily' | 'monthly';
    page?: number;
    limit?: number;
}

// Interface for historical report response
export interface IReportHistoryResponse<T> {
    success: boolean;
    message?: string;
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    data: T[];
}
