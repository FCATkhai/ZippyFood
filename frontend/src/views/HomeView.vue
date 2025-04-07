<template>
    <div class="min-h-screen bg-base-100">
        <!-- Hero Section -->
        <div class="hero min-h-screen"
            style="background-image: url('https://res.cloudinary.com/dpzwsiz0s/image/upload/v1743762960/ZippyFood/zafygk3tns8wabfrim2g.jpg');">
            <div class="hero-overlay"></div>
            <div class="hero-content text-neutral-content text-center">
                <div class="max-w-md">
                    <h1 class="mb-5 text-5xl font-bold">ZippyFood</h1>
                    <p class="mb-5 text-lg">
                        Thèm món gì - Đặt ngay món đó!
                    </p>

                    <button class="btn btn-primary"><RouterLink to="/restaurants">Đặt hàng ngay</RouterLink></button>
                </div>
            </div>
        </div>

        <!-- Features Section -->
        <div class="container mx-auto px-4 py-16">
            <h2 class="text-3xl font-bold text-center mb-12">Dịch vụ đỉnh cao</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="card bg-base-100 shadow-xl">
                    <div class="card-body items-center text-center">
                        <i class="fa-solid fa-truck-fast text-4xl text-primary mb-4"></i>
                        <h3 class="card-title">Giao hàng siêu tốc</h3>
                        <p>Đồ ăn được giao đến trong chốc lát</p>
                    </div>
                </div>
                <div class="card bg-base-100 shadow-xl">
                    <div class="card-body items-center text-center">
                        <i class="fa-solid fa-utensils text-4xl text-primary mb-4"></i>
                        <h3 class="card-title">Đủ loại món ăn</h3>
                        <p>Hàng ngàn nhà hàng được tuyển chọn</p>
                    </div>
                </div>
                <div class="card bg-base-100 shadow-xl">
                    <div class="card-body items-center text-center">
                        <i class="fa-solid fa-shield-alt text-4xl text-primary mb-4"></i>
                        <h3 class="card-title">Thanh toán dễ dàng</h3>
                        <p>Đa dạng phương thức thanh toán, chỉ cần 1 chạm là thanh toán xong</p>
                    </div>
                </div>
            </div>
        </div>


    </div>
</template>

<script lang="ts" setup>

</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
