import { ref, reactive } from 'vue';
import {
    getAdminStats,
    getAdminCurrentStats,
    getAdminReportHistory
} from '@/api/report.api';

import type {
    IAdminReport,
    ITopProductAdmin
} from '~/shared/interface';

import type {
    IReportHistoryQuery
} from '@/interfaces/report.interface';

// Interface for admin report data (for reactive state)
interface IAdminReportData {
    total_orders: number;
    total_revenue: number;
    top_products: ITopProductAdmin[];
}

// Composable function for admin reports
export function useAdminReports() {
    // State
    const stats = reactive<{
        daily: IAdminReportData | null;
        monthly: IAdminReportData | null;
    }>({
        daily: null,
        monthly: null
    });

    const currentStats = reactive<{
        opening_restaurants: number;
        total_users: number;
        total_restaurants: number;
    }>({
        opening_restaurants: 0,
        total_users: 0,
        total_restaurants: 0
    });

    const history = reactive<{
        total: number;
        page: number;
        limit: number;
        total_pages: number;
        data: IAdminReport[];
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
    const fetchStats = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await getAdminStats();
            if (response.success) {
                stats.daily = response.daily;
                stats.monthly = response.monthly;
            } else {
                throw new Error(response.message || 'Failed to fetch admin stats');
            }
        } catch (err: any) {
            error.value = err.message || 'An error occurred';
        } finally {
            loading.value = false;
        }
    };

    const fetchCurrentStats = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await getAdminCurrentStats();
            if (response.success) {
                currentStats.opening_restaurants = response.opening_restaurants;
                currentStats.total_users = response.total_users;
                currentStats.total_restaurants = response.total_restaurants;
            } else {
                throw new Error(response.message || 'Failed to fetch current admin stats');
            }
        } catch (err: any) {
            error.value = err.message || 'An error occurred';
        } finally {
            loading.value = false;
        }
    };

    const fetchReportHistory = async (query: IReportHistoryQuery = {}) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await getAdminReportHistory(query);
            if (response.success) {
                history.total = response.total;
                history.page = response.page;
                history.limit = response.limit;
                history.total_pages = response.total_pages;
                history.data = response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch admin report history');
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
