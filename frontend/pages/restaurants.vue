<script setup>
import { ref, onMounted } from 'vue';

const restaurantName = ref('');
const restaurantAddress = ref('');
const restaurantImage = ref(null);
const restaurants = ref([]);

// Upload ảnh và lấy URL
const uploadImage = async () => {
    if (!restaurantImage.value) return '';

    const formData = new FormData();
    formData.append('file', restaurantImage.value);

    try {
        const { data } = await axios.post("http://localhost:5000/api/uploads", formData);
        return data.fileUrl; // Trả về URL động
    } catch (error) {
        console.error("Upload failed:", error);
        return "";
    }

};

// Tạo nhà hàng
const createRestaurant = async () => {
    if (!restaurantName.value || !restaurantAddress.value) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
    }

    const imageUrl = await uploadImage(); // Upload ảnh trước

    const restaurantData = {
        owner_id: '60f1b9b5e6f3b40015f1f2b1', // Giả định user ID
        name: restaurantName.value,
        location: {
            address: restaurantAddress.value,
            coordinates: [105.8544441, 21.028511], // Giả định GPS
        },
        thumbnail: imageUrl,
    };

    await axios.post('http://localhost:5000/api/restaurants', restaurantData);
    alert('Nhà hàng đã được tạo thành công!');
    fetchRestaurants(); // Refresh danh sách nhà hàng
};

// Lấy danh sách nhà hàng
const fetchRestaurants = async () => {
    const { data } = await axios.get('http://localhost:5000/api/restaurants');
    restaurants.value = data.data;
};

onMounted(fetchRestaurants);
</script>

<template>
    <div class="container">
        <h1>Quản lý Nhà hàng</h1>

        <form @submit.prevent="createRestaurant">
            <label>Tên Nhà Hàng:</label>
            <input v-model="restaurantName" required />

            <label>Địa Chỉ:</label>
            <input v-model="restaurantAddress" required />

            <label>Ảnh Nhà Hàng:</label>
            <input type="file" @change="(e) => (restaurantImage = e.target.files[0])" />

            <button type="submit">Tạo Nhà Hàng</button>
        </form>

        <h2>Danh sách Nhà Hàng</h2>
        <ul>
            <li v-for="restaurant in restaurants" :key="restaurant._id">
                <h3>{{ restaurant.name }}</h3>
                <p>{{ restaurant.location.address }}</p>
                <img :src="`http://localhost:5000${restaurant.image}`" alt="Restaurant Image" v-if="restaurant.image" />
            </li>
        </ul>
    </div>
</template>

<style scoped>
.container {
    max-width: 600px;
    margin: auto;
    text-align: center;
}

input {
    display: block;
    width: 100%;
    margin: 8px 0;
    padding: 8px;
}

button {
    background-color: blue;
    color: white;
    padding: 10px;
    border: none;
    cursor: pointer;
}

img {
    width: 100px;
    height: auto;
    margin-top: 10px;
}
</style>
