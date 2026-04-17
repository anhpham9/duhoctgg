<template>
    <div class="news-management-page">
        <div class="page-header">
            <h1>Quản lý tin tức</h1>
            <p>Danh sách và quản lý các bài viết tin tức</p>
            <button class="btn btn-primary" @click="createNews">
                <i class="fas fa-plus"></i>
                Thêm bài viết
            </button>
        </div>

        <div class="news-filters">
            <div class="filter-row">
                <input type="search" class="form-control" v-model="searchTerm" placeholder="Tìm kiếm bài viết...">
                <select class="form-control" v-model="selectedCategory">
                    <option value="">Tất cả danh mục</option>
                    <option value="du-hoc-nhat-ban">Du học Nhật Bản</option>
                    <option value="tin-tuc-giao-duc">Tin tức giáo dục</option>
                    <option value="huong-dan">Hướng dẫn</option>
                </select>
                <select class="form-control" v-model="selectedStatus">
                    <option value="">Tất cả trạng thái</option>
                    <option value="published">Đã xuất bản</option>
                    <option value="draft">Bản nháp</option>
                    <option value="archived">Lưu trữ</option>
                </select>
            </div>
        </div>

        <div class="news-table">
            <table class="table">
                <thead>
                    <tr>
                        <th>Tiêu đề</th>
                        <th>Danh mục</th>
                        <th>Tác giả</th>
                        <th>Ngày tạo</th>
                        <th>Trạng thái</th>
                        <th>Lượt xem</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="article in filteredNews" :key="article.id">
                        <td>
                            <div class="article-title">
                                <strong>{{ article.title }}</strong>
                                <p>{{ article.excerpt }}</p>
                            </div>
                        </td>
                        <td>{{ article.category }}</td>
                        <td>{{ article.author }}</td>
                        <td>{{ formatDate(article.createdAt) }}</td>
                        <td>
                            <span class="badge" :class="getStatusClass(article.status)">
                                {{ getStatusText(article.status) }}
                            </span>
                        </td>
                        <td>{{ article.views }}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" @click="editNews(article.id)">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-success" @click="viewNews(article.id)">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" @click="deleteNews(article.id)">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="pagination">
            <button class="btn btn-outline-secondary" :disabled="currentPage === 1" @click="currentPage--">
                Trước
            </button>
            <span>Trang {{ currentPage }} / {{ totalPages }}</span>
            <button class="btn btn-outline-secondary" :disabled="currentPage === totalPages" @click="currentPage++">
                Sau  
            </button>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'permission'],
    ssr: false
})

// ========================================
// PAGE TITLE & SEO
// ========================================
useHead({
    title: 'Quản lý tin tức - Admin'
})

// ========================================
// REACTIVE DATA
// ========================================
const searchTerm = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const perPage = 10

const newsData = ref([
    {
        id: 1,
        title: 'Hướng dẫn du học Nhật Bản 2024',
        excerpt: 'Thông tin chi tiết về quy trình và thủ tục du học Nhật Bản...',
        category: 'Du học Nhật Bản',
        author: 'Admin',
        createdAt: '2024-04-15',
        status: 'published',
        views: 1520
    },
    {
        id: 2,
        title: 'Cập nhật chính sách giáo dục mới',
        excerpt: 'Các thay đổi quan trọng trong chính sách giáo dục...',
        category: 'Tin tức giáo dục',
        author: 'Editor',
        createdAt: '2024-04-14',
        status: 'draft',
        views: 0
    }
])

// ========================================
// COMPUTED
// ========================================
const filteredNews = computed(() => {
    let filtered = newsData.value

    if (searchTerm.value) {
        filtered = filtered.filter(item => 
            item.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            item.excerpt.toLowerCase().includes(searchTerm.value.toLowerCase())
        )
    }

    if (selectedCategory.value) {
        filtered = filtered.filter(item => 
            item.category === selectedCategory.value
        )
    }

    if (selectedStatus.value) {
        filtered = filtered.filter(item => 
            item.status === selectedStatus.value
        )
    }

    return filtered
})

const totalPages = computed(() => {
    return Math.ceil(filteredNews.value.length / perPage)
})

// ========================================
// METHODS
// ========================================
const createNews = () => {
    navigateTo('/admin/news/create')
}

const editNews = (id) => {
    navigateTo(`/admin/news/edit/${id}`)
}

const viewNews = (id) => {
    navigateTo(`/admin/news/view/${id}`)
}

const deleteNews = async (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
        try {
            newsData.value = newsData.value.filter(item => item.id !== id)
            
            if (window.showToast) {
                window.showToast('Đã xóa bài viết thành công!', 'success')
            }
        } catch (error) {
            console.error('Error deleting news:', error)
        }
    }
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN')
}

const getStatusClass = (status) => {
    const classes = {
        'published': 'badge-success',
        'draft': 'badge-warning',
        'archived': 'badge-secondary'
    }
    return classes[status] || 'badge-secondary'
}

const getStatusText = (status) => {
    const texts = {
        'published': 'Đã xuất bản',
        'draft': 'Bản nháp',
        'archived': 'Lưu trữ'
    }
    return texts[status] || status
}

// ========================================
// LIFECYCLE
// ========================================
onMounted(async () => {
    // Load news data from API
    try {
        // const data = await $fetch('/api/admin/news')
        // newsData.value = data
    } catch (error) {
        console.error('Error loading news:', error)
    }
})
</script>

<style scoped>
.news-management-page {
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

.news-filters {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}

.filter-row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 15px;
    align-items: center;
}

.news-table {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
    margin-bottom: 20px;
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

.article-title strong {
    display: block;
    margin-bottom: 5px;
}

.article-title p {
    margin: 0;
    color: #666;
    font-size: 14px;
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

.badge-warning {
    background: #fff3cd;
    color: #856404;
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

.btn-outline-success {
    border: 1px solid #28a745;
    color: #28a745;
    background: transparent;
}

.btn-outline-danger {
    border: 1px solid #dc3545;
    color: #dc3545;
    background: transparent;
}

.btn-outline-secondary {
    border: 1px solid #6c757d;
    color: #6c757d;
    background: transparent;
}

.form-control {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
}

@media (max-width: 768px) {
    .filter-row {
        grid-template-columns: 1fr;
    }
    
    .page-header {
        flex-direction: column;
        gap: 15px;
    }
    
    .table {
        font-size: 14px;
    }
    
    .table th,
    .table td {
        padding: 8px;
    }
}
</style>