//@ts-nocheck

import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import BlankLayout from '@/layouts/BlankLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

import { USER_ROLES } from '~/shared/userRoles'
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
        path: "/admin",
        component: AdminLayout,
        meta: { requiresAuth: true, roles: [USER_ROLES.NHANVIEN, USER_ROLES.QUANLY] },
        children: [
            { path: "", name: "Dashboard", component: () => import("@/views/admin/Dashboard.vue") },
            { path: "profile", name: "AdminProfile", component: () => import("@/views/admin/profileNhanVien.vue") },
            { path: "nxb", name: "QLNXB", component: () => import("@/views/admin/QLNXB.vue") },
            { path: "sach", name: "QLSach", component: () => import("@/views/admin/QLSach.vue") },
            { path: "phieu-muon", name: "QLPhieuMuon", component: () => import("@/views/admin/QLPhieuMuon.vue") },
            { path: "doc-gia", name: "QLDocGia", component: () => import("@/views/admin/QLDocGia.vue") },
            {
                path: "nhan-vien",
                name: "QLNhanVien",
                component: () => import("@/views/admin/QLNhanVien.vue"),
                meta: { roles: [USER_ROLES.QUANLY] }, // Chỉ quản lý mới có quyền
            },
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
