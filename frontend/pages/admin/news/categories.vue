<template>
    <div class="news-categories-page">
        <div class="page-header">
            <h1>Quản lý danh mục tin tức</h1>
            <p>Tạo và quản lý các danh mục cho tin tức</p>
            <button class="btn btn-primary" @click="showCreateModal = true">
                <i class="fas fa-plus"></i>
                Thêm danh mục
            </button>
        </div>

        <div class="categories-table">
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên danh mục</th>
                        <th>Slug</th>
                        <th>Số bài viết</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="category in categories" :key="category.id">
                        <td>{{ category.id }}</td>
                        <td>{{ category.name }}</td>
                        <td>{{ category.slug }}</td>
                        <td>{{ category.postCount }}</td>
                        <td>
                            <span class="badge" :class="category.active ? 'badge-success' : 'badge-secondary'">
                                {{ category.active ? 'Hoạt động' : 'Tạm dừng' }}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" @click="editCategory(category)">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" @click="deleteCategory(category.id)">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal tạo/sửa danh mục -->
        <div v-if="showCreateModal" class="modal-overlay" @click="closeModal">
            <div class="modal" @click.stop>
                <div class="modal-header">
                    <h3>{{ editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới' }}</h3>
                    <button @click="closeModal" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Tên danh mục</label>
                        <input type="text" class="form-control" v-model="categoryForm.name" placeholder="Nhập tên danh mục">
                    </div>
                    <div class="form-group">
                        <label>Slug</label>
                        <input type="text" class="form-control" v-model="categoryForm.slug" placeholder="slug-danh-muc">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" v-model="categoryForm.active">
                            Kích hoạt danh mục
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="closeModal">Hủy</button>
                    <button class="btn btn-primary" @click="saveCategory">
                        {{ editingCategory ? 'Cập nhật' : 'Tạo mới' }}
                    </button>
                </div>
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
    title: 'Quản lý danh mục tin tức - Admin'
})

// ========================================
// REACTIVE DATA
// ========================================
const categories = ref([
    { id: 1, name: 'Du học Nhật Bản', slug: 'du-hoc-nhat-ban', postCount: 15, active: true },
    { id: 2, name: 'Tin tức giáo dục', slug: 'tin-tuc-giao-duc', postCount: 8, active: true },
    { id: 3, name: 'Hướng dẫn', slug: 'huong-dan', postCount: 12, active: false }
])

const showCreateModal = ref(false)
const editingCategory = ref(null)
const categoryForm = ref({
    name: '',
    slug: '',
    active: true
})

// ========================================
// METHODS
// ========================================
const editCategory = (category) => {
    editingCategory.value = category
    categoryForm.value = { ...category }
    showCreateModal.value = true
}

const deleteCategory = async (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
        try {
            // API call to delete
            categories.value = categories.value.filter(c => c.id !== id)
            
            if (window.showToast) {
                window.showToast('Đã xóa danh mục thành công!', 'success')
            }
        } catch (error) {
            console.error('Error deleting category:', error)
        }
    }
}

const saveCategory = async () => {
    try {
        if (editingCategory.value) {
            // Update existing
            const index = categories.value.findIndex(c => c.id === editingCategory.value.id)
            categories.value[index] = { ...categoryForm.value }
        } else {
            // Create new
            const newCategory = {
                ...categoryForm.value,
                id: Date.now(),
                postCount: 0
            }
            categories.value.push(newCategory)
        }
        
        if (window.showToast) {
            window.showToast('Đã lưu danh mục thành công!', 'success')
        }
        
        closeModal()
    } catch (error) {
        console.error('Error saving category:', error)
    }
}

const closeModal = () => {
    showCreateModal.value = false
    editingCategory.value = null
    categoryForm.value = {
        name: '',
        slug: '',
        active: true
    }
}
</script>

<style scoped>
.news-categories-page {
    padding: 20px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30px;
}

.page-header h1 {
    color: #2c3e50;
    margin: 0;
}

.page-header p {
    color: #7f8c8d;
    margin: 5px 0 0 0;
}

.categories-table {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
}

.table {
    width: 100%;
    margin: 0;
    border-collapse: collapse;
}

.table th,
.table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
}

.table th {
    background: #f8f9fa;
    font-weight: 500;
}

.badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
}

.badge-success {
    background: #d4edda;
    color: #155724;
}

.badge-secondary {
    background: #e2e3e5;
    color: #383d41;
}

.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
}

.btn-sm {
    padding: 4px 8px;
    font-size: 12px;
    margin-right: 5px;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-outline-primary {
    border: 1px solid #007bff;
    color: #007bff;
    background: transparent;
}

.btn-outline-danger {
    border: 1px solid #dc3545;
    color: #dc3545;
    background: transparent;
}

/* Modal styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal {
    background: white;
    border-radius: 8px;
    width: 500px;
    max-height: 80vh;
    overflow: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
}

.modal-body {
    padding: 20px;
}

.modal-footer {
    padding: 20px;
    border-top: 1px solid #eee;
    text-align: right;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
}

.form-control {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.close-btn {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #666;
}
</style>