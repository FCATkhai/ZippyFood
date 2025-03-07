<template>
    <div>
        <input type="file" @change="uploadImage" />
        <img v-if="imageUrl" :src="imageUrl" alt="Uploaded Image" />
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useFetch } from "#app";

const imageUrl = ref("");

const uploadImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const { data, error } = await useFetch("/api/uploads", {
        method: "POST",
        body: formData,
    });

    if (error.value) {
        console.error("Upload failed:", error.value);
    } else {
        imageUrl.value = data.value.imageUrl;
    }
};
</script>