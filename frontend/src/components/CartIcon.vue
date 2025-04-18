<template>
    <div>
        <label for="drawer-cart" tabindex="0" role="button" class="btn btn-ghost btn-circle">
            <div class="indicator">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span v-if="totalItems !== 0" class="badge badge-sm indicator-item indicator-start">{{ totalItems }}</span>
            </div>
        </label>
        <div class="z-2 drawer drawer-end">
            <input id="drawer-cart" type="checkbox" class="drawer-toggle" v-model="showDrawer" />
            <div class="drawer-side">
                <label for="drawer-cart" aria-label="close sidebar" class="drawer-overlay"></label>
                <ul class="menu bg-base-200 text-base-content min-h-full w-2/3 p-4 px-5 lg:w-1/3 lg:px-10">
                    <div class="cart-container">
                        <div class="flex justify-between items-center border-b pb-4">
                            <button @click="showDrawer = !showDrawer" class="text-2xl font-light cursor-pointer">✕</button>
                            <h1 class="text-xl font-bold text-center">Giỏ hàng</h1>
                            <div class="w-8"></div>
                        </div>

                        <div class="py-4 text-center text-gray-500 border-b">
                            <span class="flex items-center justify-center gap-2">
                                <i class="fas fa-clock"></i>
                                Delivery time: 20 min (500 km away)
                            </span>
                        </div>

                        <div class="py-4 border-b">
                            <h2 class="text-xl font-bold">Tên nhà hàng</h2>
                        </div>

                        <div class="py-4">
                            <template v-if="!cart && isLoading">
                                <div class="text-center">Loading cart...</div>
                            </template>
                            <template v-else-if="cart?.items.length === 0">
                                <div class="text-center text-gray-500">
                                    Giỏ hàng của bạn đang trống
                                </div>
                            </template>
                            <template v-else-if="cart?.items">
                                <div v-for="item in cart.items" :key="item.product_id"
                                    class="flex items-center justify-between py-4 border-b">
                                    <div class="flex items-center">
                                        <div class="flex items-center mr-4" @click.stop>
                                            <button class="text-xl text-primary font-bold px-2"
                                                :disabled="updatingItem === item.product_id"
                                                @click="updateQuantity(item, -1)">
                                                -
                                            </button>
                                            <span class="mx-3">
                                                <span v-if="updatingItem === item.product_id" class="loading loading-spinner loading-xs"></span>
                                                <span v-else>{{ item.quantity }}</span>
                                            </span>
                                            <button class="text-xl text-primary font-bold px-2"
                                                :disabled="updatingItem === item.product_id"
                                                @click="updateQuantity(item, 1)">
                                                +
                                            </button>
                                        </div>
                                        <div class="flex items-center">
                                            <img :src="item.image" :alt="item.name"
                                                class="w-16 h-16 object-cover rounded-md mr-3" />
                                            <span>{{ item.name }}</span>
                                        </div>
                                    </div>
                                    <div class="text-right font-medium">
                                        {{ formatPrice(item.final_price * item.quantity) }}
                                    </div>
                                </div>
                            </template>
                        </div>

                        <div class="py-4 border-b">
                            <div class="flex justify-between items-center">
                                <span class="font-medium">Subtotal</span>
                                <span class="font-medium">{{ totalPrice }} đ</span>
                            </div>
                            <p class="text-gray-500 mt-2 text-sm">
                                Phí vận chuyển sẽ được tính khi bạn đặt hàng
                            </p>
                        </div>

                        <div class="py-4 border-b">
                            <div class="flex justify-between items-center">
                                <span class="text-xl font-bold">Total</span>
                                <span class="text-xl font-bold">{{ totalPrice }} đ</span>
                            </div>
                        </div>

                        <div class="py-4">
                            <button class="btn btn-primary w-full py-4 text-white font-medium rounded-md"
                                @click="reviewOrder">
                                Review Order
                            </button>
                        </div>
                    </div>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useCartStore } from '@/stores/cart.store';
import type { ICartItem } from '~/shared/interface';
import { useRouter } from 'vue-router';
const router = useRouter();

const cartStore = useCartStore();
const cart = computed(() => cartStore.cart);
const totalItems = computed(() => cartStore.totalItems);
const totalPrice = computed(() => cartStore.totalPrice);
const isLoading = computed(() => cartStore.loading);
const showDrawer = ref(false);
const updatingItem = ref<string | null>(null);

const updateQuantity = async (item: ICartItem, change: number) => {
    const newQuantity = item.quantity + change;
    updatingItem.value = item.product_id;

    try {
        if (newQuantity <= 0) {
            if (confirm(`Are you sure you want to remove ${item.name} from your cart?`)) {
                await cartStore.removeFromCart(item.product_id);
            }
        } else {
            await cartStore.updateCartItem(item.product_id, newQuantity);
        }
    } catch (error) {
        console.error('Failed to update item:', error);
    } finally {
        updatingItem.value = null;
    }
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
};

const reviewOrder = () => {
    console.log('Proceeding to review order');
    showDrawer.value = false;
    router.push('/checkout');
};

onMounted(() => {
    cartStore.fetchCart();
    console.log('Cart fetched:', cartStore.cart);
});
</script>

<style scoped>
.loading {
    display: inline-block;
    vertical-align: middle;
}
</style>
