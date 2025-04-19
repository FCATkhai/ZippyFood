import axios from "@/utils/axios";
import type {
    IMerchantReport,
    IAdminReport,
} from '~/shared/interface';

import type {
        IMerchantStatsResponse,
        IMerchantCurrentStatsResponse,
        IAdminStatsResponse,
        IAdminCurrentStatsResponse,
        IReportHistoryResponse,
        IReportHistoryQuery
}  from '@/interfaces/report.interface';

const API_URL = "/stats";

/**
 * Fetch and save merchant daily/monthly statistics
 * @returns Merchant stats
 */
export const getMerchantStats = async (restaurant_id: string) => {
    const res = await axios.get<IMerchantStatsResponse>(`${API_URL}/merchant/${restaurant_id}`);
    return res.data;
};

/**
 * Fetch current merchant statistics (pending orders, total products)
 * @returns Current merchant stats
 */
export const getMerchantCurrentStats = async (restaurant_id: string) => {
    const res = await axios.get<IMerchantCurrentStatsResponse>(`${API_URL}/merchant/current/${restaurant_id}`);
    return res.data;
};

/**
 * Fetch historical merchant reports
 * @param query Query parameters for filtering and pagination
 * @returns Paginated merchant reports
 */
export const getMerchantReportHistory = async (restaurant_id: string, query: IReportHistoryQuery = {}) => {
    const params = new URLSearchParams();
    if (query.start_date) params.append('start_date', query.start_date);
    if (query.end_date) params.append('end_date', query.end_date);
    if (query.period) params.append('period', query.period);
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const res = await axios.get<IReportHistoryResponse<IMerchantReport>>(`${API_URL}/merchant/history/${restaurant_id}`, { params });
    return res.data;
};

/**
 * Fetch and save admin daily/monthly statistics
 * @returns Admin stats
 */
export const getAdminStats = async () => {
    const res = await axios.get<IAdminStatsResponse>(`${API_URL}/admin`);
    return res.data;
};

/**
 * Fetch current admin statistics (opening restaurants, total users, total restaurants)
 * @returns Current admin stats
 */
export const getAdminCurrentStats = async () => {
    const res = await axios.get<IAdminCurrentStatsResponse>(`${API_URL}/admin/current`);
    return res.data;
};

/**
 * Fetch historical admin reports
 * @param query Query parameters for filtering and pagination
 * @returns Paginated admin reports
 */
export const getAdminReportHistory = async (query: IReportHistoryQuery = {}) => {
    const params = new URLSearchParams();
    if (query.start_date) params.append('start_date', query.start_date);
    if (query.end_date) params.append('end_date', query.end_date);
    if (query.period) params.append('period', query.period);
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const res = await axios.get<IReportHistoryResponse<IAdminReport>>(`${API_URL}/admin/history`, { params });
    return res.data;
};
