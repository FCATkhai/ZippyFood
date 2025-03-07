<template>
    <div class="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 class="text-2xl font-semibold mb-4">Tạo Nhà Hàng</h2>
      <form @submit.prevent="submitForm" enctype="multipart/form-data">
        <div class="mb-4">
          <label class="block text-sm font-medium">Tên nhà hàng</label>
          <input v-model="form.name" type="text" class="w-full p-2 border rounded" required />
        </div>
  
        <div class="mb-4">
          <label class="block text-sm font-medium">Địa chỉ</label>
          <input v-model="form.address" type="text" class="w-full p-2 border rounded" required />
        </div>
  
        <div class="mb-4">
          <label class="block text-sm font-medium">Ảnh nhà hàng</label>
          <input type="file" @change="handleFileChange" class="w-full p-2 border rounded" required/>
        </div>
  
        <button type="submit" class="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Tạo nhà hàng
        </button>
  
        <p v-if="successMessage" class="text-green-600 mt-2">{{ successMessage }}</p>
        <p v-if="errorMessage" class="text-red-600 mt-2">{{ errorMessage }}</p>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const form = ref({
    name: '',
    address: '',
    thumbnail: null
  });
  
  const successMessage = ref('');
  const errorMessage = ref('');
  
  const handleFileChange = (event) => {
    form.value.thumbnail = event.target.files[0];
  };
  
  const submitForm = async () => {
    const formData = new FormData();
    formData.append('name', form.value.name);
    formData.append('address', form.value.address);
    if (form.value.thumbnail) {
      formData.append('file', form.value.thumbnail);
    }
  
    try {
        const url = '/api/restaurants';
      const {success, data} = await $fetch(url, {
        method: 'POST',
        body: formData
      });
      console.log(data);
      if (success === false) {
        errorMessage.value = error.value.message;
      } else {
        successMessage.value = 'Nhà hàng đã được tạo thành công!';
        form.value = { name: '', address: '', thumbnail: null };
      }
    } catch (error) {
      errorMessage.value = 'Có lỗi xảy ra khi tạo nhà hàng!';
      console.error('Error:', error.response?.status, error.data);
      console.log(error);
    }
  };
  </script>
  
  <style scoped>
  /* Tùy chỉnh CSS */
  </style>
  