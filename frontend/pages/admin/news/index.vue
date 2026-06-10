<template>
    <div class="news-management-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Không thể truy cập Quản lý tin tức</h3>
                <p>Chỉ Superadmin, Admin, Manager và Editor mới có thể quản lý tin tức.</p>
                <NuxtLink to="/admin" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i>
                    Quay lại Dashboard
                </NuxtLink>
            </div>
        </div>

        <div v-else>
            <div class="page-header">
                <div class="header-content">
                    <h1>
                        <i class="fas fa-newspaper"></i>
                        Quản lý tin tức
                    </h1>
                    <p>Danh sách và quản lý các bài viết tin tức</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-primary" @click="createNews">
                        <i class="fas fa-plus"></i>
                        Thêm bài viết
                    </button>
                    <button class="btn btn-secondary" @click="fetchNews" :disabled="loading">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                        Làm mới
                    </button>
                </div>
            </div>

            <div class="news-filters">
                <div class="filter-row">
                    <input
                        v-model="searchTerm"
                        type="search"
                        class="form-control"
                        placeholder="Tìm theo tiêu đề hoặc nội dung..."
                    >
                    <select v-model="selectedCategory" class="form-control">
                        <option value="">Tất cả danh mục</option>
                        <option v-for="category in categories" :key="category.id" :value="category.slug">
                            {{ category.name }}
                        </option>
                    </select>
                    <select v-model="selectedStatus" class="form-control">
                        <option value="">Tất cả trạng thái</option>
                        <option value="published">Đã xuất bản</option>
                        <option value="draft">Bản nháp</option>
                        <option value="archived">Lưu trữ</option>
                    </select>
                </div>
            </div>

            <div class="news-table">
                <div v-if="loading" class="loading-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Đang tải dữ liệu tin tức...</p>
                </div>

                <div v-else-if="error" class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Lỗi: {{ error }}</p>
                    <button class="btn btn-primary" @click="fetchNews">Thử lại</button>
                </div>

                <div v-else-if="paginatedNews.length > 0" class="table-container">
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
                            <tr v-for="article in paginatedNews" :key="article.id">
                                <td>
                                    <div class="article-title">
                                        <strong>{{ article.title }}</strong>
                                        <p>{{ article.excerpt || 'Không có mô tả ngắn' }}</p>
                                    </div>
                                </td>
                                <td>{{ article.category_name || 'Chưa phân loại' }}</td>
                                <td>{{ article.author_name || article.author_username || 'N/A' }}</td>
                                <td>{{ formatDate(article.created_at) }}</td>
                                <td>
                                    <span class="badge" :class="getStatusClass(article.status)">
                                        {{ getStatusText(article.status) }}
                                    </span>
                                </td>
                                <td>{{ Number(article.view_count || 0) }}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="editNews(article.id)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-success" @click="viewNews(article.id)">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button
                                        class="btn btn-sm btn-outline-danger"
                                        :disabled="deletingId === article.id || !canDelete"
                                        @click="deleteNews(article.id, article.title)"
                                    >
                                        <i class="fas" :class="deletingId === article.id ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-else class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Không tìm thấy bài viết</h3>
                    <p>Không có bài viết phù hợp với bộ lọc hiện tại.</p>
                </div>
            </div>

            <div v-if="!loading && !error && filteredNews.length > 0" class="pagination">
                <button class="btn btn-outline-secondary" :disabled="currentPage === 1" @click="currentPage--">
                    Trước
                </button>
                <span>Trang {{ currentPage }} / {{ totalPages }}</span>
                <button class="btn btn-outline-secondary" :disabled="currentPage === totalPages" @click="currentPage++">
                    Sau
                </button>
            </div>
        </div>

        <Toast />
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { useNotifications } from '~/composables/useNotifications'

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'permission'],
    ssr: false
})

useHead({
    title: 'Quản lý tin tức - Admin'
})

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const {
    loadingUser,
    hasAnyRole,
    currentUser,
    fetchCurrentUser
} = useCurrentUser()

const {
    showSuccess,
    showError,
    showInfo
} = useNotifications()

const hasPermission = computed(() => {
    return !loadingUser.value && hasAnyRole([1, 2, 3, 4])
})

const canDelete = computed(() => {
    return hasAnyRole([1, 2])
})

const searchTerm = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const perPage = 10
const loading = ref(false)
const error = ref('')
const deletingId = ref(null)

const newsData = ref([])
const categories = ref([])

const fetchCategories = async () => {
    try {
        const response = await fetch(`${API_BASE}/categories`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()
        if (response.ok) {
            categories.value = data.data || []
        }
    } catch {
        categories.value = []
    }
}

const fetchNews = async () => {
    loading.value = true
    error.value = ''

    try {
        const response = await fetch(`${API_BASE}/news`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        newsData.value = data.data || []
    } catch (err) {
        error.value = err.message || 'Không thể tải dữ liệu tin tức'
    } finally {
        loading.value = false
    }
}

const filteredNews = computed(() => {
    let filtered = newsData.value

    if (searchTerm.value) {
        const q = searchTerm.value.toLowerCase()
        filtered = filtered.filter((item) => {
            return (item.title || '').toLowerCase().includes(q) || (item.content || '').toLowerCase().includes(q)
        })
    }

    if (selectedCategory.value) {
        filtered = filtered.filter((item) => item.category_slug === selectedCategory.value)
    }

    if (selectedStatus.value) {
        filtered = filtered.filter((item) => item.status === selectedStatus.value)
    }

    return filtered
})

const totalPages = computed(() => {
    return Math.max(1, Math.ceil(filteredNews.value.length / perPage))
})

const paginatedNews = computed(() => {
    const start = (currentPage.value - 1) * perPage
    const end = start + perPage
    return filteredNews.value.slice(start, end)
})

watch([searchTerm, selectedCategory, selectedStatus], () => {
    currentPage.value = 1
})

watch(totalPages, (pages) => {
    if (currentPage.value > pages) {
        currentPage.value = pages
    }
})

const createNews = () => {
    showInfo('Trang tạo bài viết chưa được triển khai trong workspace này.')
}

const editNews = () => {
    showInfo('Trang chỉnh sửa bài viết chưa được triển khai trong workspace này.')
}

const viewNews = () => {
    showInfo('Trang xem chi tiết bài viết chưa được triển khai trong workspace này.')
}

const deleteNews = async (id, title) => {
    if (!canDelete.value) {
        showError('Bạn không có quyền xóa bài viết.')
        return
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}"?`)) {
        return
    }

    deletingId.value = id
    try {
        const response = await fetch(`${API_BASE}/news/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        showSuccess(data?.message || 'Đã xóa bài viết thành công!')
        await fetchNews()
    } catch (err) {
        showError(err.message || 'Không thể xóa bài viết')
    } finally {
        deletingId.value = null
    }
}

const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('vi-VN')
}

const getStatusClass = (status) => {
    const classes = {
        published: 'badge-success',
        draft: 'badge-warning',
        archived: 'badge-secondary'
    }
    return classes[status] || 'badge-secondary'
}

const getStatusText = (status) => {
    const texts = {
        published: 'Đã xuất bản',
        draft: 'Bản nháp',
        archived: 'Lưu trữ'
    }
    return texts[status] || status
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await Promise.all([fetchNews(), fetchCategories()])
    }
})
</script>

<style scoped>
.permission-check {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 2rem;
}

.loading-permission,
.permission-denied {
    text-align: center;
    max-width: 500px;
    padding: 3rem 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.loading-permission i {
    font-size: 3rem;
    color: #2196F3;
    margin-bottom: 1rem;
}

.permission-denied i {
    font-size: 3rem;
    color: #f44336;
    margin-bottom: 1rem;
}

.permission-denied h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.5rem;
}

.permission-denied p {
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.5;
}

.news-management-page {
    padding: 0;
    min-height: 100vh;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    padding: 1.5rem 0;
    border-bottom: 2px solid #eee;
}

.header-content h1 {
    color: #333;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 2rem;
}

.header-content h1 i {
    color: #d32f2f;
}

.header-content p {
    color: #666;
    margin: 0;
    font-size: 1.1rem;
}

.header-actions {
    display: flex;
    gap: 1rem;
}

.news-filters {
    padding: 1.5rem 2rem;
    background: #f8f9fa;
    border-bottom: 1px solid #eee;
}

.filter-row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 1rem;
    align-items: center;
}

.news-table {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 1rem;
}

.table-container {
    overflow-x: auto;
}

.table {
    width: 100%;
    margin: 0;
    border-collapse: collapse;
}

.table th,
.table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
}

.table th {
    background: #f8f9fa;
    font-weight: 600;
    white-space: nowrap;
    border-bottom: 2px solid #eee;
}

.table tbody tr:hover {
    background: #f9f9f9;
}

.article-title strong {
    display: block;
    margin-bottom: 0.25rem;
}

.article-title p {
    margin: 0;
    color: #666;
    font-size: 0.875rem;
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

.loading-state,
.error-state,
.empty-state {
    padding: 3rem 2rem;
    text-align: center;
    color: #666;
}

.loading-state i {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #2196F3;
}

.error-state i,
.empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #ccc;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    font-size: 0.9rem;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-sm {
    padding: 4px 8px;
    font-size: 12px;
    margin-right: 5px;
}

.btn-primary {
    background: #1976d2;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #1565c0;
}

.btn-secondary {
    background: #f5f5f5;
    color: #666;
}

.btn-secondary:hover:not(:disabled) {
    background: #eee;
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
    padding: 0.75rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;
}

.form-control:focus {
    outline: none;
    border-color: #1976d2;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 1rem 0;
}

@media (max-width: 1024px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
}

@media (max-width: 768px) {
    .news-management-page {
        padding: 0;
    }

    .page-header {
        padding: 1rem 0;
    }

    .news-filters {
        padding: 1rem;
    }

    .filter-row {
        grid-template-columns: 1fr;
    }

    .table th,
    .table td {
        padding: 0.75rem 0.5rem;
        font-size: 0.9rem;
    }
}

@media (max-width: 480px) {
    .header-content h1 {
        font-size: 1.5rem;
    }

    .table {
        font-size: 0.8rem;
    }

    .btn-sm {
        padding: 0.35rem 0.45rem;
    }
}
</style>