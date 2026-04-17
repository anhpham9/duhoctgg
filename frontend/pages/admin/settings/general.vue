<template>
    <div class="settings-general-page">
        <div class="page-header">
            <h1>Cài đặt chung</h1>
            <p>Quản lý các cài đặt chung của hệ thống</p>
        </div>

        <div class="settings-form">
            <div class="form-group">
                <label>Tên website</label>
                <input type="text" class="form-control" v-model="settings.siteName" placeholder="Nhập tên website">
            </div>

            <div class="form-group">
                <label>Mô tả website</label>
                <textarea class="form-control" rows="3" v-model="settings.siteDescription" placeholder="Mô tả ngắn về website"></textarea>
            </div>

            <div class="form-group">
                <label>Email liên hệ</label>
                <input type="email" class="form-control" v-model="settings.contactEmail" placeholder="email@example.com">
            </div>

            <div class="form-group">
                <label>Số điện thoại</label>
                <input type="tel" class="form-control" v-model="settings.phone" placeholder="0123456789">
            </div>

            <div class="form-group">
                <label>Địa chỉ</label>
                <textarea class="form-control" rows="2" v-model="settings.address" placeholder="Nhập địa chỉ"></textarea>
            </div>

            <div class="form-actions">
                <button class="btn btn-primary" @click="saveSettings">
                    <i class="fas fa-save"></i>
                    Lưu cài đặt
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
    title: 'Cài đặt chung - Admin'
})

// ========================================
// REACTIVE DATA
// ========================================
const settings = ref({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    phone: '',
    address: ''
})

// ========================================
// METHODS
// ========================================
const saveSettings = async () => {
    try {
        // API call to save settings
        // await $fetch('/api/admin/settings/general', {
        //     method: 'POST',
        //     body: settings.value
        // })
        
        if (window.showToast) {
            window.showToast('Đã lưu cài đặt thành công!', 'success')
        }
    } catch (error) {
        console.error('Error saving settings:', error)
        if (window.showToast) {
            window.showToast('Có lỗi xảy ra khi lưu!', 'error')
        }
    }
}

const resetForm = () => {
    settings.value = {
        siteName: '',
        siteDescription: '',
        contactEmail: '',
        phone: '',
        address: ''
    }
}

// ========================================
// LIFECYCLE
// ========================================
onMounted(async () => {
    // Load existing settings
    try {
        // const data = await $fetch('/api/admin/settings/general')
        // settings.value = data
    } catch (error) {
        console.error('Error loading settings:', error)
    }
})
</script>

<style scoped>
.settings-general-page {
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

.settings-form {
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