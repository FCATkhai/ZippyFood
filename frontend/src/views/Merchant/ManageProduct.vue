<template>
    <div class="p-4">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Quản lý Món ăn</h1>
            <div class="flex gap-2">
                <button class="btn btn-primary" @click="openCategoryModal">
                    <i class="fas fa-list mr-2"></i> Quản lý Danh mục
                </button>
                <button class="btn btn-success" @click="openProductModal()">
                    <i class="fas fa-plus mr-2"></i> Thêm Món ăn
                </button>
            </div>
        </div>

        <!-- Danh sách Danh mục -->
        <div class="tabs mb-4">
            <a v-for="(cat, index) in ['all', ...categoryNames]" :key="index"
                :class="['tab tab-bordered', selectedCategoryTab === cat ? 'tab-active' : '']"
                @click="selectedCategoryTab = cat">
                {{ cat === 'all' ? 'Tất cả' : cat }}
            </a>
        </div>

        <!-- Danh sách Món ăn -->
        <div class="overflow-x-auto">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th class="w-24">Hình ảnh</th>
                        <th>Tên món</th>
                        <th>Danh mục</th>
                        <th>Giá</th>
                        <th>Trạng thái</th>
                        <th class="w-36">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="loading" class="h-32">
                        <td colspan="6" class="text-center">
                            <span class="loading loading-spinner loading-lg"></span>
                        </td>
                    </tr>
                    <tr v-else-if="filteredProducts.length === 0" class="h-32">
                        <td colspan="6" class="text-center">
                            Không có món ăn nào. Hãy thêm món ăn mới!
                        </td>
                    </tr>
                    <template v-else>
                        <tr v-for="product in filteredProducts" :key="product._id">
                            <td>
                                <div class="avatar">
                                    <div class="mask mask-squircle w-16 h-16">
                                        <img :src="product.image" :alt="product.name" class="object-cover" />
                                    </div>
                                </div>
                            </td>
                            <td class="font-medium">{{ product.name }}</td>
                            <td>
                                {{ getCategoryName(product.category_id) }}
                            </td>
                            <td>
                                <div><span class="line-through" v-if="hasDiscount(product)">{{
                                        formatPrice(product.price) }}đ</span></div>
                                <div :class="{ 'text-success': hasDiscount(product) }">
                                    {{ formatPrice(product.final_price) }}đ
                                </div>
                                <div v-if="hasDiscount(product)" class="text-sm text-success">
                                    {{ getDiscountText(product) }}
                                </div>
                            </td>
                            <td>
                                <div class="form-control">
                                    <label class="cursor-pointer label">
                                        <input type="checkbox" class="toggle toggle-success"
                                            :checked="product.status === 'available'"
                                            @change="toggleProductStatus(product)" />
                                        <span class="label-text ml-2">
                                            {{ product.status === 'available' ? 'Còn hàng' : 'Hết hàng' }}
                                        </span>
                                    </label>
                                </div>
                            </td>
                            <td>
                                <div class="flex gap-2">
                                    <button class="btn btn-sm btn-warning" @click="openProductModal(product)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-error" @click="confirmDeleteProduct(product)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>

        <!-- Modal Quản lý Danh mục -->
        <div class="modal" :class="{ 'modal-open': showCategoryModal }">
            <div class="modal-box max-w-3xl">
                <h3 class="font-bold text-lg mb-4">Quản lý Danh mục</h3>

                <div class="flex items-end gap-2 mb-4">
                    <div class="form-control flex-1">
                        <label class="label">
                            <span class="label-text">Tên danh mục</span>
                        </label>
                        <input type="text" v-model="newCategory.name" placeholder="Nhập tên danh mục"
                            class="input input-bordered w-full" />
                    </div>
                    <div class="form-control flex-1">
                        <label class="label">
                            <span class="label-text">Mô tả (tùy chọn)</span>
                        </label>
                        <input type="text" v-model="newCategory.description" placeholder="Nhập mô tả"
                            class="input input-bordered w-full" />
                    </div>
                    <button class="btn btn-primary h-12"
                        @click="editingCategoryId ? updateCategory() : createCategory()">
                        {{ editingCategoryId ? 'Cập nhật' : 'Thêm mới' }}
                    </button>
                </div>

                <div class="overflow-x-auto">
                    <table class="table w-full">
                        <thead>
                            <tr>
                                <th>Tên danh mục</th>
                                <th>Mô tả</th>
                                <th>Số món</th>
                                <th class="w-24">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="categoryLoading" class="h-32">
                                <td colspan="4" class="text-center">
                                    <span class="loading loading-spinner loading-lg"></span>
                                </td>
                            </tr>
                            <tr v-else-if="categories.length === 0" class="h-32">
                                <td colspan="4" class="text-center">
                                    Không có danh mục nào. Hãy thêm danh mục mới!
                                </td>
                            </tr>
                            <template v-else>
                                <tr v-for="cat in categories" :key="cat._id">
                                    <td>{{ cat.name }}</td>
                                    <td>{{ cat.description || '-' }}</td>
                                    <td>{{ countProductsInCategory(cat._id) }}</td>
                                    <td>
                                        <div class="flex gap-2">
                                            <button class="btn btn-xs btn-warning" @click="editCategory(cat)">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-xs btn-error" @click="confirmDeleteCategory(cat)">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>

                <div class="modal-action">
                    <button class="btn" @click="closeCategoryModal">Đóng</button>
                </div>
            </div>
        </div>

        <!-- Modal Thêm/Sửa Món ăn -->
        <div class="modal" :class="{ 'modal-open': showProductModal }">
            <div class="modal-box max-w-3xl">
                <h3 class="font-bold text-lg mb-4">
                    {{ editingProductId ? 'Chỉnh sửa Món ăn' : 'Thêm Món ăn mới' }}
                </h3>

                <form class="grid grid-cols-2 gap-4" @submit.prevent="saveProduct">
                    <!-- Tên món -->
                    <div class="form-control col-span-2">
                        <label class="label">
                            <span class="label-text">Tên món ăn*</span>
                        </label>
                        <input type="text" v-model="productForm.name" placeholder="Nhập tên món ăn"
                            class="input input-bordered w-full" required />
                    </div>

                    <!-- Mô tả -->
                    <div class="form-control col-span-2">
                        <label class="label">
                            <span class="label-text">Mô tả</span>
                        </label>
                        <textarea v-model="productForm.description" placeholder="Nhập mô tả món ăn"
                            class="textarea textarea-bordered w-full" rows="3"></textarea>
                    </div>

                    <!-- Giá -->
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">Giá (VND)*</span>
                        </label>
                        <input type="number" v-model.number="productForm.price" placeholder="Nhập giá món ăn"
                            class="input input-bordered w-full" required min="0" />
                    </div>

                    <!-- Discount -->
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">Hình thức giảm giá</span>
                        </label>
                        <div class="flex flex-col gap-2">
                            <div class="flex items-center gap-2">
                                <select v-model="discountType" class="select select-bordered flex-1">
                                    <option value="none">Không giảm giá</option>
                                    <option value="percentage">Giảm theo phần trăm</option>
                                    <option value="direct">Giảm trực tiếp</option>
                                </select>
                            </div>

                            <div v-if="discountType === 'percentage'">
                                <div class="flex items-center gap-2">
                                    <input type="number" v-model.number="discountPercentage"
                                        placeholder="Nhập % giảm giá" class="input input-bordered w-full" min="0"
                                        max="100" step="0.1" />
                                    <span>%</span>
                                </div>
                                <p class="text-sm text-info mt-1" v-if="discountPercentage > 0">
                                    Giá sau giảm: {{ formatPrice(calculateFinalPrice()) }}đ
                                </p>
                            </div>

                            <div v-if="discountType === 'direct'">
                                <div class="flex items-center gap-2">
                                    <input type="number" v-model.number="discountAmount" placeholder="Nhập số tiền giảm"
                                        class="input input-bordered w-full" min="0" :max="productForm.price"
                                        step="1000" />
                                    <span>đ</span>
                                </div>
                                <p class="text-sm text-info mt-1" v-if="discountAmount > 0">
                                    Giá sau giảm: {{ formatPrice(calculateFinalPrice()) }}đ
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Danh mục -->
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">Danh mục*</span>
                        </label>
                        <div class="flex gap-2">
                            <select v-model="productForm.category_id" class="select select-bordered flex-1" required>
                                <option value="" disabled selected>Chọn danh mục</option>
                                <option v-for="cat in categories" :key="cat._id" :value="cat._id">
                                    {{ cat.name }}
                                </option>
                            </select>
                            <button type="button" class="btn" @click="openQuickCategoryModal">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Tags -->
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">Thẻ tag</span>
                        </label>
                        <div class="flex gap-2 items-center">
                            <input type="text" v-model="tagInput" placeholder="Nhập tag và nhấn Enter"
                                class="input input-bordered flex-1" @keyup.enter="addTag" />
                            <button type="button" class="btn" @click="addTag">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="flex flex-wrap gap-2 mt-2">
                            <div v-for="(tag, index) in productForm.tags" :key="index"
                                class="badge badge-primary badge-lg gap-2">
                                {{ tag }}
                                <button type="button" @click="removeTag(index)">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Hình ảnh -->
                    <div class="form-control col-span-2">
                        <label class="label">
                            <span class="label-text">Hình ảnh món ăn</span>
                        </label>
                        <input type="file" class="file-input file-input-bordered w-full" accept="image/*"
                            @change="handleImageChange" />
                    </div>

                    <!-- Preview ảnh -->
                    <div v-if="imagePreview || (editingProductId && productForm.image)" class="col-span-2">
                        <div class="w-40 h-40 overflow-hidden rounded-lg">
                            <img :src="imagePreview || productForm.image" class="w-full h-full object-cover"
                                alt="Preview" />
                        </div>
                    </div>

                    <div class="modal-action col-span-2">
                        <button type="button" class="btn" @click="closeProductModal" :disabled="loading">Hủy</button>
                        <button type="submit" class="btn btn-primary" :disabled="loading">
                            <span v-if="loading" class="loading loading-spinner"></span>
                            {{ editingProductId ? 'Cập nhật' : 'Thêm mới' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal Thêm nhanh Danh mục -->
        <div class="modal" :class="{ 'modal-open': showQuickCategoryModal }">
            <div class="modal-box">
                <h3 class="font-bold text-lg mb-4">Thêm Danh mục mới</h3>
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Tên danh mục*</span>
                    </label>
                    <input type="text" v-model="newCategory.name" placeholder="Nhập tên danh mục"
                        class="input input-bordered w-full" required />
                </div>
                <div class="form-control mt-2">
                    <label class="label">
                        <span class="label-text">Mô tả</span>
                    </label>
                    <input type="text" v-model="newCategory.description" placeholder="Nhập mô tả"
                        class="input input-bordered w-full" />
                </div>
                <div class="modal-action">
                    <button class="btn" @click="closeQuickCategoryModal">Hủy</button>
                    <button class="btn btn-primary" @click="createCategoryAndSelect">Thêm và chọn</button>
                </div>
            </div>
        </div>

        <!-- Modal Xác nhận xóa -->
        <div class="modal" :class="{ 'modal-open': showDeleteConfirmModal }">
            <div class="modal-box">
                <h3 class="font-bold text-lg">Xác nhận xóa</h3>
                <p class="py-4">{{ deleteConfirmMessage }}</p>
                <div class="modal-action">
                    <button class="btn" @click="cancelDelete">Hủy</button>
                    <button class="btn btn-error" @click="confirmDelete">Xóa</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useCategory } from '@/composables/useCategory';
import { useProduct } from '@/composables/useProduct';
import { useToast } from 'vue-toastification';
import { useRestaurantStore } from '@/stores/restaurantStore';

// State
const restaurantStore = useRestaurantStore();
const selectedCategoryTab = ref('all');
const showCategoryModal = ref(false);
const showProductModal = ref(false);
const showQuickCategoryModal = ref(false);
const showDeleteConfirmModal = ref(false);
const deleteConfirmMessage = ref('');
const deleteType = ref(''); // 'product' hoặc 'category'
const deleteItemId = ref(null);
const imagePreview = ref(null);
const tagInput = ref('');
const editingCategoryId = ref(null);
const editingProductId = ref(null);
const discountType = ref('none');
const discountPercentage = ref(0);
const discountAmount = ref(0);

// Composables
const { categories, loading: categoryLoading, fetchCategories, addCategory, editCategory: updateCategoryApi, removeCategory } = useCategory();
const { products, loading, fetchProducts, addProduct, editProduct, removeProduct, updateProductStatus } = useProduct();
const toast = useToast();

// Form state
const newCategory = reactive({
    restaurant_id: '',
    name: '',
    description: ''
});

const productForm = reactive({
    restaurant_id: '',
    name: '',
    description: '',
    price: 0,
    discount: 0,
    category_id: '',
    tags: [],
    image: null
});

// Computed
const categoryNames = computed(() => {
    return categories.value.map(cat => cat.name);
});

const filteredProducts = computed(() => {
    if (selectedCategoryTab.value === 'all') {
        return products.value;
    }

    const categoryId = categories.value.find(cat => cat.name === selectedCategoryTab.value)?._id;
    if (!categoryId) return [];

    return products.value.filter(product => {
        const catId = typeof product.category_id === 'object'
            ? product.category_id._id
            : product.category_id;
        return catId === categoryId;
    });
});

// Lifecycle hooks
onMounted(async () => {
    if (restaurantStore.restaurant) {
        const restaurantId = restaurantStore.restaurant._id;
        newCategory.restaurant_id = restaurantId;
        productForm.restaurant_id = restaurantId;

        await fetchCategories(restaurantId);
        await fetchProducts(restaurantId);
    } else {
        toast.error('Không tìm thấy thông tin nhà hàng');
    }
});

// Watchers
watch(() => productForm.price, () => {
    // Recalculate discount when price changes
    if (discountType.value === 'percentage' && discountPercentage.value > 0) {
        productForm.discount = discountPercentage.value < 1 ? discountPercentage.value : discountPercentage.value / 100;
    } else if (discountType.value === 'direct' && discountAmount.value > 0) {
        productForm.discount = discountAmount.value;
    }
});

// Methods
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

function getCategoryName(categoryId) {
    if (!categoryId) return 'Chưa phân loại';

    if (typeof categoryId === 'object' && categoryId.name) {
        return categoryId.name;
    }

    const category = categories.value.find(cat => cat._id === categoryId);
    return category ? category.name : 'Chưa phân loại';
}

function countProductsInCategory(categoryId) {
    return products.value.filter(product => {
        const catId = typeof product.category_id === 'object'
            ? product.category_id._id
            : product.category_id;
        return catId === categoryId;
    }).length;
}

function hasDiscount(product) {
    return product.discount > 0 && product.final_price < product.price;
}

function getDiscountText(product) {
    if (!hasDiscount(product)) return '';

    // Nếu discount < 1, đó là phần trăm (0.1 = 10%)
    if (product.discount < 1) {
        return `Giảm ${(product.discount * 100).toFixed(1)}%`;
    } else {
        // Nếu không là giảm trực tiếp
        return `Giảm ${formatPrice(product.discount)}đ`;
    }
}

function calculateFinalPrice() {
    const price = productForm.price || 0;

    if (discountType.value === 'none') {
        return price;
    } else if (discountType.value === 'percentage') {
        const discount = discountPercentage.value > 1 ? discountPercentage.value / 100 : discountPercentage.value;
        return price * (1 - discount);
    } else if (discountType.value === 'direct') {
        return Math.max(0, price - discountAmount.value);
    }

    return price;
}

// Category functions
function openCategoryModal() {
    resetCategoryForm();
    showCategoryModal.value = true;
}

function closeCategoryModal() {
    resetCategoryForm();
    showCategoryModal.value = false;
}

function resetCategoryForm() {
    newCategory.name = '';
    newCategory.description = '';
    editingCategoryId.value = null;
}

async function createCategory() {
    if (!newCategory.name) {
        toast.error('Vui lòng nhập tên danh mục');
        return;
    }

    try {
        await addCategory({
            restaurant_id: restaurantStore.restaurant?._id,
            name: newCategory.name,
            description: newCategory.description
        });
        toast.success('Thêm danh mục thành công');
        resetCategoryForm();
    } catch (error) {
        toast.error('Có lỗi xảy ra khi thêm danh mục');
    }
}

function editCategory(category) {
    editingCategoryId.value = category._id;
    newCategory.name = category.name;
    newCategory.description = category.description || '';
}

async function updateCategory() {
    if (!newCategory.name) {
        toast.error('Vui lòng nhập tên danh mục');
        return;
    }

    try {
        await updateCategoryApi(editingCategoryId.value, {
            name: newCategory.name,
            description: newCategory.description
        });
        toast.success('Cập nhật danh mục thành công');
        resetCategoryForm();
    } catch (error) {
        toast.error('Có lỗi xảy ra khi cập nhật danh mục');
    }
}

function confirmDeleteCategory(category) {
    deleteType.value = 'category';
    deleteItemId.value = category._id;
    deleteConfirmMessage.value = `Bạn có chắc chắn muốn xóa danh mục "${category.name}"? Các món ăn thuộc danh mục này sẽ được chuyển sang "Chưa phân loại".`;
    showDeleteConfirmModal.value = true;
}

// Product functions
function openProductModal(product = null) {
    resetProductForm();

    if (product) {
        editingProductId.value = product._id;
        productForm.name = product.name;
        productForm.description = product.description || '';
        productForm.price = product.price;
        productForm.category_id = typeof product.category_id === 'object'
            ? product.category_id._id
            : product.category_id;
        productForm.tags = [...(product.tags || [])];
        productForm.image = product.image;

        // Set discount type and value based on the existing product
        if (product.discount > 0) {
            if (product.discount < 1) {
                discountType.value = 'percentage';
                discountPercentage.value = product.discount * 100;
                discountAmount.value = 0;
            } else {
                discountType.value = 'direct';
                discountAmount.value = product.discount;
                discountPercentage.value = 0;
            }
        } else {
            discountType.value = 'none';
            discountPercentage.value = 0;
            discountAmount.value = 0;
        }
    } else {
        discountType.value = 'none';
        discountPercentage.value = 0;
        discountAmount.value = 0;
    }

    showProductModal.value = true;
}

function closeProductModal() {
    resetProductForm();
    showProductModal.value = false;
}

function resetProductForm() {
    productForm.name = '';
    productForm.description = '';
    productForm.price = 0;
    productForm.discount = 0;
    productForm.category_id = '';
    productForm.tags = [];
    productForm.image = null;
    imagePreview.value = null;
    editingProductId.value = null;
    tagInput.value = '';
    discountType.value = 'none';
    discountPercentage.value = 0;
    discountAmount.value = 0;
}

function handleImageChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);

    // Save to form
    productForm.image = file;
}

function addTag() {
    if (!tagInput.value.trim()) return;

    if (!productForm.tags.includes(tagInput.value.trim())) {
        productForm.tags.push(tagInput.value.trim());
    }

    tagInput.value = '';
}

function removeTag(index) {
    productForm.tags.splice(index, 1);
}

async function saveProduct() {
    try {
        // Set the discount value based on the selected type
        if (discountType.value === 'none') {
            productForm.discount = 0;
        } else if (discountType.value === 'percentage') {
            // Convert to decimal if percentage is above 1
            productForm.discount = discountPercentage.value >= 1
                ? discountPercentage.value / 100
                : discountPercentage.value;
        } else if (discountType.value === 'direct') {
            productForm.discount = discountAmount.value;
        }

        if (editingProductId.value) {
            await editProduct(editingProductId.value, {
                name: productForm.name,
                description: productForm.description,
                price: productForm.price,
                discount: productForm.discount,
                category_id: productForm.category_id,
                tags: productForm.tags,
                image: productForm.image instanceof File ? productForm.image : undefined
            });
            toast.success('Cập nhật món ăn thành công');
        } else {
            await addProduct({
                restaurant_id: restaurantStore.restaurant?._id,
                name: productForm.name,
                description: productForm.description,
                price: productForm.price,
                discount: productForm.discount,
                category_id: productForm.category_id,
                tags: productForm.tags,
                image: productForm.image
            });
            toast.success('Thêm món ăn thành công');
        }
        closeProductModal();
    } catch (error) {
        toast.error('Có lỗi xảy ra khi lưu món ăn');
    }
}

function confirmDeleteProduct(product) {
    deleteType.value = 'product';
    deleteItemId.value = product._id;
    deleteConfirmMessage.value = `Bạn có chắc chắn muốn xóa món "${product.name}"?`;
    showDeleteConfirmModal.value = true;
}

async function toggleProductStatus(product) {
    const newStatus = product.status === 'available' ? 'unavailable' : 'available';
    try {
        await updateProductStatus(product._id, newStatus);
        toast.success(`Đã chuyển món "${product.name}" sang trạng thái ${newStatus === 'available' ? 'Còn hàng' : 'Hết hàng'}`);
    } catch (error) {
        toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
}

// Quick category modal
function openQuickCategoryModal() {
    resetCategoryForm();
    showQuickCategoryModal.value = true;
}

function closeQuickCategoryModal() {
    resetCategoryForm();
    showQuickCategoryModal.value = false;
}

async function createCategoryAndSelect() {
    if (!newCategory.name) {
        toast.error('Vui lòng nhập tên danh mục');
        return;
    }

    try {
        const category = await addCategory({
            restaurant_id: restaurantStore.restaurant?._id,
            name: newCategory.name,
            description: newCategory.description
        });

        if (category && category._id) {
            productForm.category_id = category._id;
            toast.success('Thêm danh mục thành công');
        }

        closeQuickCategoryModal();
    } catch (error) {
        toast.error('Có lỗi xảy ra khi thêm danh mục');
    }
}

// Delete confirmation
function cancelDelete() {
    deleteType.value = '';
    deleteItemId.value = null;
    deleteConfirmMessage.value = '';
    showDeleteConfirmModal.value = false;
}


async function confirmDelete() {
    try {
        if (deleteType.value === 'category') {
            await removeCategory(deleteItemId.value);
            toast.success('Xóa danh mục thành công');
        } else if (deleteType.value === 'product') {
            await removeProduct(deleteItemId.value);
            toast.success('Xóa món ăn thành công');
        }
    } catch (error) {
        toast.error(`Có lỗi xảy ra khi xóa ${deleteType.value === 'category' ? 'danh mục' : 'món ăn'}`);
    } finally {
        cancelDelete();
    }
}
</script>
