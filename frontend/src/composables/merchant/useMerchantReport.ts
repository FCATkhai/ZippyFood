import { ref, reactive } from 'vue';
import {
    getMerchantStats,
    getMerchantCurrentStats,
    getMerchantReportHistory
} from '@/api/report.api';

import type {
    IMerchantReport,
    ITopProduct
} from '~/shared/interface';

import type {
    IReportHistoryQuery
} from '@/interfaces/report.interface';

// Interface for report data (for reactive state)
interface IReportData {
    completed_orders: number;
    revenue: number;
    top_products: ITopProduct[];
}

// Composable function for merchant reports
export function useMerchantReports() {
    // State
    const stats = reactive<{
        daily: IReportData | null;
        monthly: IReportData | null;
    }>({
        daily: null,
        monthly: null
    });

    const currentStats = reactive<{
        pending_orders: number;
        total_products: number;
    }>({
        pending_orders: 0,
        total_products: 0
    });

    const history = reactive<{
        total: number;
        page: number;
        limit: number;
        total_pages: number;
        data: IMerchantReport[];
    }>({
        total: 0,
        page: 1,
        limit: 10,
        total_pages: 0,
        data: []
    });

    const loading = ref(false);
    const error = ref<string | null>(null);

    // Methods
    const fetchStats = async (restaurant_id: string) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await getMerchantStats(restaurant_id);
            if (response.success) {
                stats.daily = response.daily;
                stats.monthly = response.monthly;
            } else {
                throw new Error(response.message || 'Failed to fetch merchant stats');
            }
        } catch (err: any) {
            error.value = err.message || 'An error occurred';
        } finally {
            loading.value = false;
        }
    };

    const fetchCurrentStats = async (restaurant_id: string) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await getMerchantCurrentStats(restaurant_id);
            if (response.success) {
                currentStats.pending_orders = response.pending_orders;
                currentStats.total_products = response.total_products;
            } else {
                throw new Error(response.message || 'Failed to fetch current merchant stats');
            }
        } catch (err: any) {
            error.value = err.message || 'An error occurred';
        } finally {
            loading.value = false;
        }
    };

    const fetchReportHistory = async (restaurant_id: string, query: IReportHistoryQuery = {}) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await getMerchantReportHistory(restaurant_id, query);
            if (response.success) {
                history.total = response.total;
                history.page = response.page;
                history.limit = response.limit;
                history.total_pages = response.total_pages;
                history.data = response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch merchant report history');
            }
        } catch (err: any) {
            error.value = err.message || 'An error occurred';
        } finally {
            loading.value = false;
        }
    };

    return {
        stats,
        currentStats,
        history,
        loading,
        error,
        fetchStats,
        fetchCurrentStats,
        fetchReportHistory
    };
}
