<template>
    <div class="container">
        <div class="row">
            <div class="col-sm-8 mt-3">
                <h4>Node.js upload images - bezkoder.com</h4>

                <form class="mt-4" @submit.prevent="handleSubmit" enctype="multipart/form-data">
                    <div class="form-group">
                        <input type="file" multiple id="input-files" class="form-control-file border"
                            @change="previewImages" ref="fileInput" />
                    </div>
                    <button type="submit" class="btn btn-primary">Submit</button>
                </form>
            </div>
        </div>
        <hr />
        <div class="row">
            <div class="col-sm-12">
                <div class="preview-images">
                    <img v-for="(image, index) in previewImageUrls" :key="index" :src="image" alt="Preview" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ImageUpload',
    data() {
        return {
            previewImageUrls: []
        }
    },
    methods: {
        previewImages(event) {
            this.previewImageUrls = []
            const files = event.target.files
            if (files) {
                Array.from(files).forEach(file => {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        this.previewImageUrls.push(e.target.result)
                    }
                    reader.readAsDataURL(file)
                })
            }
        },
        async handleSubmit() {
            try {
                const files = this.$refs.fileInput.files
                const formData = new FormData()
                Array.from(files).forEach(file => {
                    formData.append('file', file)
                })

                const response = await fetch('/api/uploads', {
                    method: 'POST',
                    body: formData
                })

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const result = await response.json()
                console.log('Upload successful', result)
            } catch (error) {
                console.error('Upload failed', error)
            }
        }
    }
}
</script>

<style scoped>
div.preview-images>img {
    width: 30%;
}
</style>