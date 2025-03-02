<script setup>
import { ref } from "vue";

const imageUrl = ref("");

// Hàm tải ảnh từ API
const fetchImage = async (filename) => {
  const { data, error } = await useFetch(`/api/uploads/${filename}`);

  if (error.value) {
    console.error("Lỗi tải ảnh:", error.value);
    return;
  }

  imageUrl.value = `/api/uploads/${filename}`; // URL ảnh từ backend
};

// Gọi API lấy ảnh (đổi filename thành tên ảnh đã upload)
fetchImage("1740837502833-4f984996a40bf0f35a0a2534ae3ff1ca5f867132r1-401-401v2_00.jpg");
</script>

<template>
  <div>
    <h2>Ảnh từ GridFS</h2>
    <img v-if="imageUrl" :src="imageUrl" alt="Image" width="200" />
    <p v-else>Đang tải ảnh...</p>
  </div>
</template>
