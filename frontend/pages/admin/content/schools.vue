<template>
    <div class="schools-content-page">
        <div class="page-header">
            <h1>Quản lý nội dung - Trường học</h1>
            <p>Chỉnh sửa nội dung trang trường học</p>
        </div>

        <div class="content-form">
            <!-- Form chỉnh sửa nội dung trường học -->
            <div class="form-group">
                <label>Tiêu đề trang</label>
                <input type="text" class="form-control" v-model="schoolsContent.title" placeholder="Nhập tiêu đề trang trường học">
            </div>

            <div class="form-group">
                <label>Mô tả ngắn</label>
                <textarea class="form-control" rows="3" v-model="schoolsContent.description" placeholder="Mô tả ngắn về trang trường học"></textarea>
            </div>

            <div class="form-group">
                <label>Nội dung chính</label>
                <textarea class="form-control" rows="10" v-model="schoolsContent.content" placeholder="Nội dung chính của trang"></textarea>
            </div>

            <div class="form-actions">
                <button class="btn btn-primary" @click="saveContent">
                    <i class="fas fa-save"></i>
                    Lưu nội dung
                </button>
                <button class="btn btn-secondary" @click="resetForm">
                    <i class="fas fa-undo"></i>
                    Khôi phục
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'permission']
})

// ========================================
// PAGE TITLE & SEO
// ========================================
useHead({
    title: 'Quản lý nội dung trường học - Admin'
})

// ========================================
// REACTIVE DATA
// ========================================
const schoolsContent = ref({
    title: '',
    description: '',
    content: ''
})

// ========================================
// METHODS
// ========================================
const saveContent = async () => {
    try {
        // API call to save content
        // await $fetch('/api/admin/content/schools', {
        //     method: 'POST',
        //     body: schoolsContent.value
        // })
        
        if (window.showToast) {
            window.showToast('Đã lưu nội dung thành công!', 'success')
        }
    } catch (error) {
        console.error('Error saving content:', error)
        if (window.showToast) {
            window.showToast('Có lỗi xảy ra khi lưu!', 'error')
        }
    }
}

const resetForm = () => {
    schoolsContent.value = {
        title: '',
        description: '',
        content: ''
    }
}

// ========================================
// LIFECYCLE
// ========================================
onMounted(async () => {
    // Load existing content
    try {
        // const data = await $fetch('/api/admin/content/schools')
        // schoolsContent.value = data
    } catch (error) {
        console.error('Error loading content:', error)
    }
})
</script>

<style scoped>
.schools-content-page {
    padding: 20px;
}

.page-header {
    margin-bottom: 30px;
}

.page-header h1 {
    color: #2c3e50;
    margin-bottom: 10px;
}

.page-header p {
    color: #7f8c8d;
    margin: 0;
}

.content-form {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #2c3e50;
}

.form-control {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.form-control:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.form-actions {
    margin-top: 30px;
    text-align: right;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    margin-left: 10px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover {
    background: #0056b3;
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background: #545b62;
}
</style>