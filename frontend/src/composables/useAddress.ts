import { ref, computed } from "vue";
import { addAddress, updateAddress, deleteAddress } from "@/api/address.api";
import { useAuthStore } from "@/stores/auth.store";

interface IApiResponse {
    success: boolean;
    message?: string;
    addresses?: string[];
}

export function useAddress() {
    const authStore = useAuthStore();
    const addresses = ref<string[]>(authStore.user?.addresses || []);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    async function add(userId: string, address: string) {
        loading.value = true;
        error.value = null;
        try {
            const response: IApiResponse = await addAddress(userId, address);
            if (response.success && response.addresses) {
                addresses.value = response.addresses;
                if (authStore.user && authStore.user._id.toString() === userId) {
                    authStore.addAddress(address);
                }
            } else {
                throw new Error(response.message || "Failed to add address");
            }
        } catch (err: any) {
            error.value = err.message || "Error adding address";
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function update(userId: string, index: number, address: string) {
        loading.value = true;
        error.value = null;
        try {
            const response: IApiResponse = await updateAddress(userId, index, address);
            if (response.success && response.addresses) {
                addresses.value = response.addresses;
                if (authStore.user && authStore.user._id.toString() === userId) {
                    authStore.updateAddress(index, address);
                }
            } else {
                throw new Error(response.message || "Failed to update address");
            }
        } catch (err: any) {
            error.value = err.message || "Error updating address";
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function remove(userId: string, index: number) {
        loading.value = true;
        error.value = null;
        try {
            const response: IApiResponse = await deleteAddress(userId, index);
            if (response.success && response.addresses) {
                addresses.value = response.addresses;
                if (authStore.user && authStore.user._id.toString() === userId) {
                    authStore.removeAddress(index);
                }
            } else {
                throw new Error(response.message || "Failed to delete address");
            }
        } catch (err: any) {
            error.value = err.message || "Error deleting address";
            throw err;
        } finally {
            loading.value = false;
        }
    }

    function reset() {
        addresses.value = authStore.user?.addresses || [];
        loading.value = false;
        error.value = null;
    }

    return {
        addresses: computed(() => addresses.value),
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        add,
        update,
        remove,
        reset,
    };
}
