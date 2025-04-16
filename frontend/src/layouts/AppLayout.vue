<template>
    <Navbar />
    <RouterView class="min-h-screen" />
    <Footer />
</template>

<script lang="ts" setup>
    import Navbar from '@/components/Navbar.vue';
    import Footer from '@/components/Footer.vue';
</script>
