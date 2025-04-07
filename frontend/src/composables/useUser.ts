// useUsers.ts
import { ref, watch } from "vue";
import {
    createUser,
    changeUserRole,
    getUsers,
    getUserById,
    updateUser,
    changePassword,
    deleteUser,
} from "@/api/user.api"; // Adjust path as needed
import type { IUser } from "~/shared/interface";

export function useUsers() {
    const users = ref<IUser[]>([]);
    const user = ref<IUser | null>(null);
    const page = ref(1);
    const limit = ref(10);
    const totalPages = ref(1);
    const total = ref(0);
    const hasMore = ref(true);
    const loading = ref(false);
    const searchTerm = ref("");
    const roleFilter = ref<"customer" | "restaurant_owner" | "admin" | "">("");
    const sortOrder = ref<"asc" | "desc">("asc");

    let searchTimeout: ReturnType<typeof setTimeout> | null = null;

    // Fetch all users with filters
    const fetchUsers = async (reset = false) => {
        if (loading.value) return;

        if (reset) {
            page.value = 1;
            hasMore.value = true;
        }

        loading.value = true;
        try {
            const response = await getUsers({
                page: page.value,
                limit: limit.value,
                search: searchTerm.value,
                role: roleFilter.value,
                sort: sortOrder.value,
            });
            users.value = response.data || [];
            total.value = response.total || 0;
            totalPages.value = response.totalPages || 1;
            hasMore.value = response.hasMore || false;

            if (users.value.length === 0 && page.value > 1) {
                page.value--;
                await fetchUsers();
            }
        } catch (error) {
            console.error("Lỗi tải danh sách người dùng:", error);
        } finally {
            loading.value = false;
        }
    };

    // Fetch single user by ID
    const fetchUser = async (id: string) => {
        loading.value = true;
        try {
            const response = await getUserById(id);
            user.value = response.user || null;
            return response.user;
        } catch (error) {
            console.error("Lỗi khi tải người dùng:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Create new user
    const addUser = async (data: {
        name: string;
        email: string;
        password: string;
        phone: string;
        role?: string;
    }) => {
        loading.value = true;
        try {
            const response = await createUser(data);
            return response.user;
        } catch (error) {
            console.error("Lỗi khi tạo người dùng:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Update user information
    const editUser = async (id: string, data: Partial<IUser>) => {
        loading.value = true;
        try {
            const response = await updateUser(id, data);
            return response.user;
        } catch (error) {
            console.error("Lỗi khi cập nhật người dùng:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Change user role
    const updateUserRole = async (id: string, role: "customer" | "restaurant_owner" | "admin") => {
        loading.value = true;
        try {
            const response = await changeUserRole(id, role);
            return response.user;
        } catch (error) {
            console.error("Lỗi khi thay đổi vai trò:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Change password
    const updatePassword = async (id: string, oldPassword: string, newPassword: string) => {
        loading.value = true;
        try {
            const response = await changePassword(id, { oldPassword, newPassword });
            return response.message;
        } catch (error) {
            console.error("Lỗi khi thay đổi mật khẩu:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Delete user
    const removeUser = async (id: string) => {
        loading.value = true;
        try {
            await deleteUser(id);
        } catch (error) {
            console.error("Lỗi khi xóa người dùng:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    // Watch for filter changes with debounce
    watch([searchTerm, roleFilter, sortOrder], () => {
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            fetchUsers(true);
        }, 500);
    });

    // Watch page changes
    watch(page, () => {
        fetchUsers();
    });

    return {
        users,
        user,
        page,
        limit,
        totalPages,
        hasMore,
        loading,
        searchTerm,
        roleFilter,
        sortOrder,
        fetchUsers,
        fetchUser,
        addUser,
        editUser,
        updateUserRole,
        updatePassword,
        removeUser,
    };
}
