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
                <div class="category-tabs overflow-x-auto whitespace-nowrap mb-4 border-b sticky top-0 bg-base-100 z-1">
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
                                class="product-card bg-base-100 rounded-lg shadow-sm cursor-pointer">
                                <div @click="showProductDetail(product)" class="flex">
                                    <div class="product-image w-36 h-36 overflow-hidden">
                                        <img :src="product.image" :alt="product.name"
                                            class="w-full h-full object-cover" />
                                    </div>
                                    <div class="product-info p-4 flex-1">
                                        <h3 class="text-lg font-semibold">{{ product.name }}</h3>
                                        <p class="text-gray-400">{{ product?.description }}</p>
                                        <div class="mt-4 flex items-center justify-between">
                                            <div>
                                                <p v-if="product.final_price !== product.price"
                                                    class="text-gray-400 line-through">{{ formatPrice(product.price) }}
                                                </p>
                                                <p class="text-lg font-bold">
                                                    {{ formatPrice(product.final_price) }}
                                                </p>
                                            </div>
                                            <button v-if="is_opening" class="btn btn-circle btn-primary text-white"
                                                @click.stop="addToCart(product)">
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

            <!-- Product detail -->
            <div class="z-2 drawer drawer-end">
                <input id="drawer-product" type="checkbox" class="drawer-toggle" v-model="showDrawer" />
                <div class="drawer-side">
                    <label for="drawer-product" aria-label="close sidebar" class="drawer-overlay"></label>
                    <ul class="menu bg-base-200 text-base-content min-h-full w-2/3 p-4 px-5 lg:w-1/3 lg:px-10">
                        <div class="cart-container">
                            <div class="flex justify-between items-center border-b pb-4">
                                <button @click="toggleDrawer" class="text-2xl font-light cursor-pointer">✕</button>
                                <div class="w-8"></div>
                            </div>
                            <template v-if="selectedProduct && is_opening">
                                <div class="py-4">
                                    <div class="flex justify-between py-4 border-b">
                                        <div class="flex">
                                            <img :src="selectedProduct.image" :alt="selectedProduct.name"
                                                class="w-25 h-25 object-cover rounded-md mr-3" />
                                            <div>
                                                <h3 class="font-bold text-2xl">{{ selectedProduct.name }}</h3>
                                                <p class="text-gray-500">{{ selectedProduct.description }}</p>
                                            </div>
                                        </div>
                                        <div class="text-right font-bold text-2xl">
                                            {{ formatPrice(selectedProduct.final_price) }}
                                        </div>
                                    </div>
                                </div>

                                <div class="flex justify-between py-4">
                                    <div class="flex items-center mr-4" @click.stop>
                                        <button class="text-xl text-primary font-bold px-2" :disabled="updatingItem"
                                            @click="updateQuantity(-1)">
                                            -
                                        </button>
                                        <span class="mx-3">
                                            <span v-if="updatingItem" class="loading loading-spinner loading-xs"></span>
                                            <span v-else>{{ itemQuantity }}</span>
                                        </span>
                                        <button class="text-xl text-primary font-bold px-2" :disabled="updatingItem"
                                            @click="updateQuantity(1)">
                                            +
                                        </button>
                                    </div>
                                    <button v-if="itemQuantity === 0 && selectedItem" class="btn btn-error py-4 text-white font-medium rounded-md"
                                        @click="deleteItemFromCart">
                                        Xoá khỏi giỏ hàng
                                    </button>
                                    <button v-else-if="itemQuantity === 0" class="btn btn-error py-4 text-white font-medium rounded-md"
                                        @click="toggleDrawer">
                                        Huỷ
                                    </button>
                                    <button v-else-if="!selectedItem" class="btn btn-primary py-4 text-white font-medium rounded-md"
                                        @click="handleDetailProductSubmit">
                                        Thêm vào giỏ hàng - {{ formatPrice(selectedProduct.final_price * itemQuantity) }}
                                        ₫
                                    </button>
                                    <button v-else class="btn btn-primary py-4 text-white font-medium rounded-md"
                                        @click="handleDetailProductSubmit">
                                        Cập nhật giỏ hàng - {{ formatPrice(selectedProduct.final_price * itemQuantity) }}
                                        ₫
                                    </button>
                                </div>
                            </template>
                        </div>
                    </ul>
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
import { onMounted, ref, computed, watch } from "vue";
import type { ICartItem, IProduct, IRestaurant } from "~/shared/interface";
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';


// Store instances
const authStore = useAuthStore();
const cartStore = useCartStore();

const { fetchRestaurantById, loading } = useRestaurant();
const { groupedProducts, fetchGroupedProducts, loading: loadingProducts } = useProduct();
const restaurant = ref<IRestaurant | null>(null);

const activeCategory = ref('');
const is_opening = ref(true);
const working_hours = computed(() => {
    if (restaurant.value) {
        const today = new Date();
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const currentDay = daysOfWeek[today.getDay()];

        const dayData = restaurant.value.open_hours.find(day => day.day === currentDay);
        if (dayData && dayData.time_slots.length > 0) {
            return dayData.time_slots.map(slot => `${slot.start} - ${slot.end}`).join(", ");
        }
        is_opening.value = false;
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
// Product detail
// import { useCartStore } from "@/stores/cart.store";
// const cartStore = useCartStore();
const cart = computed(() => cartStore.cart);
const showDrawer = ref(false);
const selectedProduct = ref<IProduct | null>(null);
const selectedItem = ref<ICartItem | null>(null);
const itemQuantity = ref(1);
const updatingItem = ref(false);

const updateQuantity = (change: number) => {
    const newQuantity = itemQuantity.value + change;
    if (newQuantity >= 0) {
        itemQuantity.value = newQuantity;
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
        await cartStore.addToCart(product._id, itemQuantity.value);
    } catch (error) {
        console.error('Failed to add item to cart:', error);
    }
};

const resetDrawer = () => {
    selectedProduct.value = null;
    selectedItem.value = null;
    itemQuantity.value = 1;
}
const toggleDrawer = () => {
    showDrawer.value = !showDrawer.value;
    // Show drawer
    if (showDrawer.value === true && selectedItem.value) {
        itemQuantity.value = selectedItem.value.quantity;
    }


}

// reset drawer on closing
watch(showDrawer, () => {
    if (showDrawer.value === false) {
        resetDrawer();
    }
})

const showProductDetail = (product: IProduct) => {
    selectedProduct.value = product;
    // console.log("selected product:", selectedProduct.value);
    const item = cart.value?.items.find((item) => item.product_id === product._id);
    if (item) {
        selectedItem.value = item;
    }
    toggleDrawer();
    // console.log("found Item:", item);
}

const deleteItemFromCart = async () => {
    if (selectedItem.value) {
        await cartStore.removeFromCart(selectedItem.value.product_id);
    }
    toggleDrawer();
}

const handleDetailProductSubmit = async () => {
    updatingItem.value = true;
    try {
        if (selectedItem.value) {
            await cartStore.updateCartItem(selectedItem.value.product_id, itemQuantity.value);
        } else {
            if (selectedProduct.value) await addToCart(selectedProduct.value);
        }
    } catch (error) {
        console.error('Failed to update item:', error);
    } finally {
        updatingItem.value = false;
        toggleDrawer();
    }
}

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
