//@ts-nocheck

import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import BlankLayout from '@/layouts/BlankLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import MerchantLayout from '@/layouts/MerchantLayout.vue'

import { USER_GROUPS } from '~/shared/userRoles'
import { useAuthStore } from '@/stores/auth.store'

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        meta: {
            layout: AppLayout
        }
    },
    {
        path: '/about',
        name: 'about',
        component: () => import('@/views/AboutView.vue'),
        meta: {
            layout: AppLayout
        }
    },
    {
        path: '/contact',
        name: 'contact',
        component: () => import('@/views/ContactView.vue'),
        meta: {
            layout: AppLayout
        }
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('@/views/Auth/Register.vue'),
        meta: {
            layout: BlankLayout
        }
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/Auth/Login.vue'),
        meta: {
            layout: BlankLayout
        }
    },
    {
        path: '/notifications',
        name: 'order-notifications',
        component: () => import('@/views/Notification/NotificationsView.vue'),
        meta: {
            layout: AppLayout,
            requireAuth: true
        }
    },
    {
        path: '/notification/:id',
        name: 'notification-detail',
        component: () => import('@/views/Notification/NotificationDetailView.vue'),
        meta: {
            layout: AppLayout,
            requireAuth: true
        }
    },
    {
        path: '/restaurants',
        name: 'restaurants',
        component: () => import('@/views/RestaurantsView.vue'),
        meta: {
            layout: AppLayout,
        }
    },
    {
        path: '/restaurant/:id',
        name: 'restaurantDetail',
        component: () => import('@/views/RestaurantDetailView.vue'),
        meta: {
            layout: AppLayout,
        }
    },
    {
        path: '/checkout',
        name: 'checkout',
        component: () => import('@/views/CheckoutView.vue'),
        meta: {
            layout: AppLayout,
            requireAuth: true
        }
    },
    {
        path: '/order-history',
        name: 'order-history',
        component: () => import('@/views/OrderHistoryView.vue'),
        meta: {
            layout: AppLayout,
            requireAuth: true
        }
    },
    {
        path: '/review-order/:id',
        name: 'review-order',
        component: () => import('@/views/ReviewOrderView.vue'),
        meta: {
            layout: AppLayout,
            requireAuth: true
        }
    },
    {
        path: '/restaurant-register',
        name: 'register-restaurant',
        component: () => import('@/views/Restaurant/RegisterRestaurantApplication.vue'),
        meta: {
            layout: AppLayout,
            roles: USER_GROUPS.CUSTOMER_ADMIN
        }
    },
    {
        path: "/restaurant-manage/restaurant-complete",
        name: "restaurant-complete",
        component: () => import("@/views/Merchant/CompleteCreateRestaurant.vue"),
        meta: {
            layout: BlankLayout,
            roles: USER_GROUPS.RESTAURANT_OWNER
        }
    },
    {
        path: "/restaurant-manage",
        component: MerchantLayout,
        meta: { requiresAuth: true, roles: USER_GROUPS.RESTAURANT_OWNER },
        children: [
            { path: "", name: "dashboard-merchant", component: () => import("@/views/Merchant/Dashboard.vue") },
            { path: "setting", name: "restaurant-setting", component: () => import("@/views/Merchant/ManageRestaurant_Merchant.vue") },
            { path: "products", name: "product-merchant", component: () => import("@/views/Merchant/ManageProduct.vue") },
            { path: "orders", name: "order-merchant", component: () => import("@/views/Merchant/ManageOrder_Merchant.vue") },
        ],
    },
    {
        path: "/admin",
        component: AdminLayout,
        meta: { requiresAuth: true, roles: USER_GROUPS.ADMIN_ONLY },
        children: [
            { path: "", name: "dashboard-admin", component: () => import("@/views/admin/Dashboard.vue") },
            { path: "restaurant-application", name: "restaurant-application", component: () => import("@/views/admin/ManageRestaurantApplication.vue") },
            { path: "restaurant", name: "restaurant", component: () => import("@/views/admin/ManageRestaurant_Admin.vue") },
            { path: "order", name: "order", component: () => import("@/views/admin/ManageOrder_Admin.vue") },
        ],
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

// Middleware kiểm tra quyền
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const user = authStore.user;

    if (to.meta.requiresAuth) {
        if (!user) {
            return next({ name: "login" });
        }
        if (to.meta.roles && !to.meta.roles.includes(user.role)) {
            return next({ path: "/forbidden" }); // Chuyển hướng nếu không có quyền
        }
    }
    next();
});


export default router
