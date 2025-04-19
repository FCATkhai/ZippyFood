<template>
    <div class="modal-wrapper">
        <!-- Modal Trigger Button -->
        <!-- <slot name="trigger">
            <button class="btn btn-primary" @click="openModal">
                <i class="fa-solid fa-chart-line mr-2"></i>
                Xem thống kê nhà hàng
            </button>
        </slot> -->

        <!-- Modal -->
        <dialog ref="modalRef" class="modal">
            <div class="modal-box max-w-5xl">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-lg">
                        <i class="fa-solid fa-store mr-2"></i>
                        {{ restaurantName || 'Thống kê nhà hàng' }}
                    </h3>
                    <button class="btn btn-sm btn-circle btn-ghost" @click="closeModal">✕</button>
                </div>

                <div v-if="loading" class="flex justify-center items-center py-16">
                    <span class="loading loading-spinner loading-lg text-primary"></span>
                </div>

                <div v-else-if="error" class="alert alert-error">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span>{{ error }}</span>
                </div>

                <div v-else class="overflow-y-auto max-h-[70vh]">
                    <!-- Merchant Dashboard Component -->
                    <MerchantDashboard :restaurant_id="restaurantId" ref="merchantDashboardRef" />
                </div>

                <div class="modal-action">
                    <button class="btn btn-primary" @click="refreshData">
                        <i class="fa-solid fa-rotate-right mr-2"></i>
                        Làm mới
                    </button>
                    <button class="btn" @click="closeModal">Đóng</button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="closeModal">Đóng</button>
            </form>
        </dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import MerchantDashboard from './MerchantDashboard.vue';
import { useToast } from 'vue-toastification';

// Props
const props = defineProps({
    restaurantId: {
        type: String,
        required: true
    },
    restaurantName: {
        type: String,
        default: ''
    }
});

// Setup toast
const toast = useToast();

// References
const modalRef = ref(null);
const merchantDashboardRef = ref(null);

// State
const loading = ref(false);
const error = ref(null);

// Methods
const openModal = () => {
    if (modalRef.value) {
        modalRef.value.showModal();
    }
};

const closeModal = () => {
    if (modalRef.value) {
        modalRef.value.close();
    }
};

const refreshData = () => {
    if (merchantDashboardRef.value) {
        // Trigger refresh in the merchant dashboard component
        // This assumes the merchant dashboard component has a fetchReportData method
        if (typeof merchantDashboardRef.value.fetchReportData === 'function') {
            merchantDashboardRef.value.fetchReportData();
            toast.success('Dữ liệu đã được làm mới');
        }
    }
};

// Watch for changes in restaurant ID
watch(() => props.restaurantId, (newId) => {
    if (newId && modalRef.value?.open) {
        refreshData();
    }
});

// Expose methods for parent components
defineExpose({
    openModal,
    closeModal,
    refreshData
});
</script>
