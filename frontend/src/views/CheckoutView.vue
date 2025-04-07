<template>
    <div class="container mx-auto p-4 max-w-4xl">
        <h1 class="text-2xl font-bold mb-6">Checkout</h1>

        <!-- Customer Info -->
        <div class="card bg-base-100 shadow-xl mb-6">
            <div class="card-body">
                <h2 class="card-title">Customer Information</h2>
                <p><strong>Name:</strong> {{ authStore.user?.name || "N/A" }}</p>
                <p><strong>Phone:</strong> {{ authStore.user?.phone || "N/A" }}</p>

                <!-- Address Selection -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Delivery Address</span>
                    </label>
                    <select v-model="selectedAddress" class="select select-bordered w-full" :disabled="address.loading.value">
                        <option value="" disabled>Select an address</option>
                        <option v-for="(addr, idx) in address.addresses.value" :key="idx" :value="addr">
                            {{ addr }}
                        </option>
                    </select>
                    <button
                        class="btn btn-outline btn-sm mt-2"
                        @click="showAddAddressModal = true"
                        :disabled="address.loading.value"
                    >
                        <i class="fa fa-plus mr-2"></i> Add New Address
                    </button>
                </div>
            </div>
        </div>

        <!-- Cart Info -->
        <div class="card bg-base-100 shadow-xl mb-6">
            <div class="card-body">
                <h2 class="card-title">Cart Items</h2>
                <div v-if="cartStore.loading">Loading cart...</div>
                <div v-else-if="cartStore.isEmpty" class="text-center">Your cart is empty</div>
                <div v-else>
                    <div v-for="item in cartStore.cart?.items" :key="item.product_id" class="flex items-center mb-4">
                        <img :src="item.image" alt="Product" class="w-16 h-16 object-cover rounded mr-4" />
                        <div class="flex-1">
                            <p class="font-semibold">{{ item.name }}</p>
                            <p>{{ item.price.toLocaleString() }}đ x {{ item.quantity }}</p>
                        </div>
                        <div class="flex items-center">
                            <button
                                class="btn btn-sm btn-circle"
                                @click="updateCartQuantity(item.product_id.toString(), item.quantity - 1)"
                                :disabled="item.quantity <= 1 || updatingItem === item.product_id"
                            >
                                <i class="fa fa-minus"></i>
                            </button>
                            <input
                                type="number"
                                v-model.number="item.quantity"
                                @change="updateCartQuantity(item.product_id.toString(), item.quantity)"
                                class="input input-bordered w-16 mx-2 text-center"
                                min="1"
                            />
                            <button
                                class="btn btn-sm btn-circle"
                                @click="updateCartQuantity(item.product_id.toString(), item.quantity + 1)"
                                :disabled="updatingItem === item.product_id"
                            >
                                <i class="fa fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Note and Totals -->
        <div class="card bg-base-100 shadow-xl mb-6">
            <div class="card-body">
                <h2 class="card-title">Order Summary</h2>
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Note to Restaurant</span>
                    </label>
                    <textarea
                        v-model="note"
                        class="textarea textarea-bordered"
                        placeholder="E.g., No onions, please"
                    ></textarea>
                </div>
                <div class="mt-4">
                    <p><strong>Subtotal:</strong> {{ cartStore.totalPrice.toLocaleString() }}đ</p>
                    <p><strong>Delivery Fee:</strong> {{ deliveryFee.toLocaleString() }}đ</p>
                    <p><strong>Total:</strong> {{ totalPrice.toLocaleString() }}đ</p>
                </div>
            </div>
        </div>

        <!-- Place Order Button -->
        <button
            class="btn btn-primary w-full"
            @click="placeOrder"
            :disabled="order.loading.value || cartStore.isEmpty || !selectedAddress || address.loading.value"
        >
            <i class="fa fa-shopping-cart mr-2"></i> Place Order
        </button>

        <!-- Add Address Modal -->
        <div class="modal" :class="{ 'modal-open': showAddAddressModal }">
            <div class="modal-box mx-auto">
                <h3 class="font-bold text-lg">Add New Address</h3>
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Address</span>
                    </label>
                    <input
                        v-model="newAddress"
                        type="text"
                        class="input input-bordered"
                        placeholder="Enter new address"
                    />
                </div>
                <div class="modal-action">
                    <button class="btn btn-sm" @click="showAddAddressModal = false">Cancel</button>
                    <button
                        class="btn btn-primary btn-sm"
                        @click="addNewAddress"
                        :disabled="!newAddress || address.loading.value"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";
import { useOrder } from "@/composables/useOrder";
import { useAddress } from "@/composables/useAddress";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";

const toast = useToast();
const order = useOrder();
const address = useAddress();
const cartStore = useCartStore();
const authStore = useAuthStore();

const selectedAddress = ref("");
const note = ref("");
const newAddress = ref("");
const showAddAddressModal = ref(false);
const deliveryFee = ref(0);
const updatingItem = ref<string | null>(null);

const totalPrice = computed(() => cartStore.totalPrice + deliveryFee.value);

onMounted(async () => {
    await cartStore.fetchCart();
    if (authStore.user?.addresses.length && !selectedAddress.value) {
        selectedAddress.value = authStore.user.addresses[0];
    }
});

async function addNewAddress() {
    if (!authStore.user) return;
    try {
        await address.add(authStore.user._id.toString(), newAddress.value);
        selectedAddress.value = newAddress.value;
        showAddAddressModal.value = false;
        newAddress.value = "";
        toast.success("Address added successfully");
    } catch (error) {
        toast.error(address.error || "Failed to add address");
    }
}

async function updateCartQuantity(productId: string, quantity: number) {
    if (quantity < 1) return;
    try {
        updatingItem.value = productId;
        await cartStore.updateCartItem(productId, quantity);
    } catch (error) {
        toast.error(cartStore.error || "Failed to update cart");
    } finally {
        updatingItem.value = null;
    }
}

async function placeOrder() {
    if (!authStore.user || !selectedAddress.value) return;
    try {
        await order.create(selectedAddress.value, note.value);
        toast.success("Order placed successfully");
        note.value = "";
        await cartStore.fetchCart();
    } catch (error) {
        toast.error(order.error || "Failed to place order");
    }
}
</script>

<style scoped>
.modal {
    display: none;
}
.modal-open {
    display: flex;
}
</style>
