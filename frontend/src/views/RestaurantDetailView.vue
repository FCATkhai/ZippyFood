<template>
    <div class="container px-20 py-8">
        <div v-if="restaurant">
            <h1 class="text-2xl font-bold">{{ restaurant.name }}</h1>
            <div class="flex gap-10">
                <p>Giờ mở cửa</p>
                <p>Hôm nay {{ working_hours }}</p>
            </div>
            <div class="flex gap-10">
                <p>Số điện thoại liên hệ</p>
                <p>{{ restaurant.phone }}</p>
            </div>
            <div class="flex gap-10">
                <p>Địa chỉ</p>
                <p>{{ restaurant.location.address }}</p>
            </div>
            <div class="menu-container">
                <!-- Category tabs navigation -->
                <!-- Category tabs navigation -->
                <div
                    class="category-tabs overflow-x-auto whitespace-nowrap mb-4 border-b sticky top-0 bg-base-100 z-1">
                    <button v-for="(category, index) in Object.keys(groupedProducts)" :key="index"
                        class="tab tab-bordered px-4 py-2 text-base"
                        :class="{ 'tab-active border-b-2 border-primary': activeCategory === category }"
                        @click="scrollToCategory(category)">
                        {{ category }}
                    </button>
                </div>

                <!-- Categories and products -->
                <div>
                    <div v-for="(products, category) in groupedProducts" :key="category" :id="`category-${category}`"
                        class="category-section mb-12" ref="categorySections">
                        <!-- Category title -->
                        <h2 class="text-3xl font-bold mb-8">{{ category }}</h2>

                        <!-- Food items grid -->
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div v-for="product in products" :key="product._id"
                                class="product-card bg-base-100 rounded-lg shadow-sm">
                                <div class="flex">
                                    <div class="product-image w-36 h-36 overflow-hidden">
                                        <img :src="product.image" :alt="product.name"
                                            class="w-full h-full object-cover" />
                                    </div>
                                    <div class="product-info p-4 flex-1">
                                        <h3 class="text-lg font-semibold">{{ product.name }}</h3>
                                        <p class="text-gray-400">giòn ngon</p>
                                        <div class="mt-4 flex items-center justify-between">
                                            <div>
                                                <p v-if="product.final_price !== product.price"
                                                class="text-gray-400 line-through">{{ formatPrice(product.price) }}</p>
                                                <p class="text-lg font-bold">
                                                    {{ formatPrice(product.final_price) }}
                                                </p>
                                            </div>
                                            <button class="btn btn-circle btn-primary text-white"
                                                @click="addToCart(product)">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <p>Loading</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRestaurant } from "@/composables/customer/useRestaurantCustomer";
import { useProduct } from "@/composables/customer/useProductCustomer";
import { useRoute } from "vue-router";
import { onMounted, ref, computed } from "vue";
import type { IProduct, IRestaurant } from "~/shared/interface";
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';


// Store instances
const authStore = useAuthStore();
const cartStore = useCartStore();

const { fetchRestaurantById, loading } = useRestaurant();
const { groupedProducts, fetchGroupedProducts, loading: loadingProducts } = useProduct();
const restaurant = ref<IRestaurant | null>(null);

const activeCategory = ref('');

const working_hours = computed(() => {
    if (restaurant.value) {
        const today = new Date();
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const currentDay = daysOfWeek[today.getDay()];

        const dayData = restaurant.value.open_hours.find(day => day.day === currentDay);
        if (dayData && dayData.time_slots.length > 0) {
            return dayData.time_slots.map(slot => `${slot.start} - ${slot.end}`).join(", ");
        }
        return "Closed";
    }
    return false;
});

const scrollToCategory = (category: string) => {
    activeCategory.value = category;
    const element = document.getElementById(`category-${category}`);
    if (element) {
        // Add a small offset to account for sticky header
        const offset = 60;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
            top: elementPosition - offset,
            behavior: 'smooth'
        });
    }
};

// Methods
const setActiveCategory = (category: string) => {
    activeCategory.value = category;
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
};

const addToCart = async (product: IProduct) => {
    if (!authStore.isAuthenticated) {
        // Handle unauthenticated user (show login modal or redirect)
        alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
        return;
    }

    try {
        await cartStore.addToCart(product._id, 1);
    } catch (error) {
        console.error('Failed to add item to cart:', error);
    }
};

onMounted(async () => {
    const restaurantId = useRoute().params.id as string;
    try {
        const response = await fetchRestaurantById(restaurantId);
        if (response) {
            restaurant.value = response;
        }
        await fetchGroupedProducts(restaurantId);

        // Set initial active category
        const categories = Object.keys(groupedProducts.value);
        if (categories.length > 0) {
            activeCategory.value = categories[0];
        }
    } catch (error) {

    }

});






</script>

<style scoped>
.category-tabs {
    scrollbar-width: none;
    /* For Firefox */
}

.category-tabs::-webkit-scrollbar {
    display: none;
    /* For Chrome, Safari, and Opera */
}

.tab-active {
    color: #4CAF50;
    font-weight: bold;
}
</style>
