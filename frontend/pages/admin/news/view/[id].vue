<template>
    <div class="news-view-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Dang kiem tra quyen truy cap...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Khong the truy cap Chi tiet bai viet</h3>
                <p>Chi Superadmin, Admin, Manager va Editor moi co the xem chi tiet tin tuc.</p>
                <NuxtLink to="/admin/news" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i>
                    Quay lai danh sach
                </NuxtLink>
            </div>
        </div>

        <div v-else class="content-wrapper">
            <div class="page-header">
                <div>
                    <h1><i class="fas fa-file-alt"></i> Chi tiet bai viet</h1>
                    <p v-if="news.id">ID: #{{ news.id }} - {{ news.title }}</p>
                </div>
                <div class="header-actions">
                    <NuxtLink :to="`/admin/news/edit/${newsId}`" class="btn btn-primary">
                        <i class="fas fa-edit"></i>
                        Chinh sua
                    </NuxtLink>
                    <NuxtLink to="/admin/news" class="btn btn-secondary">
                        <i class="fas fa-arrow-left"></i>
                        Quay lai
                    </NuxtLink>
                </div>
            </div>

            <div v-if="loading" class="loading-box">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Dang tai chi tiet bai viet...</p>
            </div>

            <div v-else-if="error" class="error-box">
                <i class="fas fa-exclamation-triangle"></i>
                <p>{{ error }}</p>
                <button class="btn btn-primary" @click="fetchNewsDetail">Thu lai</button>
            </div>

            <div v-else class="news-detail">
                <div class="meta-grid">
                    <div class="meta-item"><span class="label">Tieu de:</span><span class="value">{{ news.title || '-' }}</span></div>
                    <div class="meta-item"><span class="label">Slug:</span><span class="value">{{ news.slug || '-' }}</span></div>
                    <div class="meta-item"><span class="label">Danh muc:</span><span class="value">{{ news.category_name || 'Chua phan loai' }}</span></div>
                    <div class="meta-item"><span class="label">Tac gia:</span><span class="value">{{ news.author_name || news.author_username || '-' }}</span></div>
                    <div class="meta-item"><span class="label">Trang thai:</span><span class="value"><span class="badge" :class="getStatusClass(news.status)">{{ getStatusText(news.status) }}</span></span></div>
                    <div class="meta-item"><span class="label">Luot xem:</span><span class="value">{{ Number(news.view_count || 0) }}</span></div>
                    <div class="meta-item"><span class="label">Ngay tao:</span><span class="value">{{ formatDate(news.created_at) }}</span></div>
                    <div class="meta-item"><span class="label">Ngay xuat ban:</span><span class="value">{{ formatDate(news.published_at) }}</span></div>
                    <div class="meta-item"><span class="label">Cap nhat:</span><span class="value">{{ formatDate(news.updated_at) }}</span></div>
                    <div class="meta-item"><span  class="badge badge-primary" v-if="news.is_featured">Featured</span></div>
                    <div class="meta-item full"><span class="label">Excerpt:</span><span class="value">{{ news.excerpt || '-' }}</span></div>
                    <div class="meta-item full"><span class="label">Thumbnail URL:</span><span class="value">{{ news.thumbnail_url || '-' }}</span></div>
                    <div class="meta-item full"><span class="label">Meta title:</span><span class="value">{{ news.meta_title || '-' }}</span></div>
                    <div class="meta-item full"><span class="label">Meta description:</span><span class="value">{{ news.meta_description || '-' }}</span></div>
                </div>

                <div class="content-block">
                    <h3>Noi dung</h3>
                    <div class="content-text">{{ news.content || '-' }}</div>
                </div>
            </div>
        </div>

        <Toast />
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'

const route = useRoute()
const newsId = route.params.id

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'permission'],
    ssr: false
})

useHead({
    title: 'Chi tiet bai viet - Admin'
})

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2, 3, 4]))

const news = ref({})
const loading = ref(true)
const error = ref('')

const fetchNewsDetail = async () => {
    loading.value = true
    error.value = ''

    try {
        const response = await fetch(`${API_BASE}/news/${newsId}`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        news.value = data.data || {}
        console.log('News Detail is_featured:', news.value.is_featured)
    } catch (err) {
        error.value = err.message || 'Khong the tai chi tiet bai viet'
    } finally {
        loading.value = false
    }
}

const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('vi-VN')
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
        published: 'Da xuat ban',
        draft: 'Ban nhap',
        archived: 'Luu tru'
    }
    return texts[status] || status || '-'
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await fetchNewsDetail()
    }
})
</script>

<style scoped>
.news-view-page { padding: 0; min-height: 100vh; }
.content-wrapper { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 2px solid #eee; }
.page-header h1 { margin: 0 0 0.5rem 0; color: #333; display: flex; align-items: center; gap: 10px; }
.page-header p { margin: 0; color: #666; }
.header-actions { display: flex; gap: 0.75rem; }
.loading-box, .error-box { text-align: center; padding: 2rem; color: #666; }
.loading-box i { font-size: 2rem; color: #2196f3; margin-bottom: 1rem; }
.error-box i { font-size: 2rem; color: #f44336; margin-bottom: 1rem; }
.news-detail { margin-top: 1rem; }
.meta-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem 1rem; margin-bottom: 1.5rem; }
.meta-item { display: flex; gap: 0.5rem; align-items: flex-start; }
.meta-item.full { grid-column: 1 / -1; }
.label { min-width: 130px; color: #666; font-weight: 600; }
.value { color: #222; word-break: break-word; }
.content-block { border-top: 1px solid #eee; padding-top: 1rem; }
.content-block h3 { margin: 0 0 0.75rem 0; color: #333; }
.content-text { white-space: pre-wrap; line-height: 1.6; color: #333; background: #fafafa; border: 1px solid #eee; border-radius: 8px; padding: 1rem; }
.badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; }
.badge-success { background: #d4edda; color: #155724; }
.badge-warning { background: #fff3cd; color: #856404; }
.badge-secondary { background: #e2e3e5; color: #383d41; }
.badge-primary { background: #dbeafe; color: #1d4ed8; }
.btn { padding: 0.75rem 1.25rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; }
.btn-primary { background: #1976d2; color: white; }
.btn-secondary { background: #f5f5f5; color: #666; }
.permission-check { display: flex; align-items: center; justify-content: center; min-height: 60vh; padding: 2rem; }
.loading-permission, .permission-denied { text-align: center; max-width: 500px; padding: 3rem 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.loading-permission i { font-size: 3rem; color: #2196f3; margin-bottom: 1rem; }
.permission-denied i { font-size: 3rem; color: #f44336; margin-bottom: 1rem; }
@media (max-width: 768px) {
    .content-wrapper { padding: 1rem; }
    .page-header { flex-direction: column; gap: 1rem; }
    .header-actions { width: 100%; display: grid; grid-template-columns: 1fr; }
    .meta-grid { grid-template-columns: 1fr; }
    .label { min-width: 110px; }
}
</style>