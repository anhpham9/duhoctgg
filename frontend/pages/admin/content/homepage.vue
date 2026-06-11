<template>
    <div class="homepage-content-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Không thể truy cập Quản lý nội dung Homepage</h3>
                <p>Chỉ Superadmin, Admin và Manager mới có thể quản lý nội dung này.</p>
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
                        <i class="fas fa-file-alt"></i>
                        Quản lý nội dung Homepage
                    </h1>
                    <p>Cập nhật SEO, hero và nội dung chi tiết cho trang Homepage.</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" :disabled="loading" @click="loadPageData">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                        Làm mới
                    </button>
                    <button class="btn btn-outline" @click="previewPublicPage">
                        <i class="fas fa-eye"></i>
                        Xem trang
                    </button>
                    <button class="btn btn-primary" :disabled="saving || !hasChanges" @click="savePageData">
                        <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-save"></i>
                        {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
                    </button>
                </div>
            </div>

            <div v-if="loading" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải nội dung...</p>
            </div>

            <div v-else class="form-layout">
                <div class="content-section">
                    <div class="section-header">
                        <h3><i class="fas fa-info-circle"></i> Thông tin trang</h3>
                        <p>Thông tin tổng quan của trang Homepage</p>
                    </div>
                    <div class="form-grid two-columns">
                        <div class="form-group">
                            <label>Tiêu đề trang <span class="required">*</span></label>
                            <input
                                v-model.trim="form.title"
                                @input="clearFieldError('title')"
                                type="text"
                                class="form-control"
                                :class="{ 'is-invalid': !!formErrors.title }"
                                placeholder="Ví dụ: Liên hệ"
                            >
                            <p v-if="formErrors.title" class="field-error">{{ formErrors.title }}</p>
                        </div>
                        <div class="form-group">
                            <label>Slug</label>
                            <input type="text" class="form-control" :value="form.slug" disabled>
                        </div>
                        <div class="form-group">
                            <label>Trạng thái</label>
                            <select v-model="form.status" class="form-control">
                                <option value="draft">draft</option>
                                <option value="published">published</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Loại trang</label>
                            <input type="text" class="form-control" :value="form.type" disabled>
                        </div>
                    </div>
                </div>

                <div class="content-section">
                    <div class="section-header">
                        <h3><i class="fas fa-heading"></i> Hero</h3>
                        <p>Nội dung hiển thị phần đầu trang</p>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Hero title</label>
                            <input v-model.trim="form.hero_title" type="text" class="form-control" placeholder="Nhập hero title">
                        </div>
                        <div class="form-group">
                            <label>Hero description</label>
                            <textarea v-model="form.hero_description" class="form-control" rows="3" placeholder="Nhập mô tả hero"></textarea>
                        </div>
                    </div>
                </div>

                <div class="content-section">
                    <div class="section-header">
                        <h3><i class="fas fa-search"></i> SEO</h3>
                        <p>Tiêu đề và mô tả metadata</p>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Meta title</label>
                            <input v-model.trim="form.meta_title" type="text" class="form-control" maxlength="255" placeholder="Nhập meta title">
                            <small class="field-hint">{{ form.meta_title.length }}/255 ký tự</small>
                        </div>
                        <div class="form-group">
                            <label>Meta description</label>
                            <textarea v-model="form.meta_description" class="form-control" rows="3" maxlength="500" placeholder="Nhập meta description"></textarea>
                            <small class="field-hint">{{ form.meta_description.length }}/500 ký tự</small>
                        </div>
                    </div>
                </div>

                <div v-if="!isDynamicPage" class="content-section">
                    <div class="section-header">
                        <h3><i class="fas fa-pen"></i> Nội dung chính</h3>
                        <p>Nội dung lưu trong bảng page_contents</p>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Content</label>
                            <textarea v-model="form.content" class="form-control content-editor" rows="16" placeholder="Nhập nội dung trang Homepage..."></textarea>
                            <small class="field-hint">{{ form.content.length }} ký tự</small>
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <button class="btn btn-secondary" :disabled="saving" @click="restoreSnapshot">
                        <i class="fas fa-undo"></i>
                        Khôi phục
                    </button>
                    <button class="btn btn-primary" :disabled="saving || !hasChanges" @click="savePageData">
                        <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-save"></i>
                        {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
                    </button>
                </div>
            </div>
        </div>

        <Toast />
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { useNotifications } from '~/composables/useNotifications'

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'permission'],
    ssr: false
})

useHead({
    title: 'Quản lý nội dung Homepage - Admin'
})

const PAGE_SLUG = 'home'

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError, showInfo } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2, 3]))

const loading = ref(false)
const saving = ref(false)

const form = reactive({
    title: '',
    slug: PAGE_SLUG,
    hero_title: '',
    hero_description: '',
    meta_title: '',
    meta_description: '',
    type: '',
    status: 'published',
    content: ''
})

const isDynamicPage = computed(() => form.type === 'dynamic')

const snapshot = ref(null)

const formErrors = reactive({
    title: '',
    hero_title: '',
    hero_description: '',
    meta_title: '',
    meta_description: '',
    content: ''
})

const normalizePayload = (payload = {}) => ({
    title: payload.title || '',
    slug: payload.slug || PAGE_SLUG,
    hero_title: payload.hero_title || '',
    hero_description: payload.hero_description || '',
    meta_title: payload.meta_title || '',
    meta_description: payload.meta_description || '',
    type: payload.type || 'static',
    status: payload.status || 'published',
    content: payload.content || ''
})

const hasChanges = computed(() => {
    if (!snapshot.value) return false
    const current = JSON.stringify(normalizePayload(form))
    const original = JSON.stringify(snapshot.value)
    return current !== original
})

const clearFieldError = (field) => {
    if (formErrors[field]) formErrors[field] = ''
}

const validateForm = () => {
    formErrors.title = ''

    const title = (form.title || '').trim()
    if (!title) {
        formErrors.title = 'Tiêu đề trang là bắt buộc'
        return false
    }

    if (title.length < 3) {
        formErrors.title = 'Tiêu đề phải có ít nhất 3 ký tự'
        return false
    }

    return true
}

const applyForm = (data = {}) => {
    const normalized = normalizePayload(data)
    Object.assign(form, normalized)
    snapshot.value = { ...normalized }
}


const loadPageData = async () => {
    loading.value = true
    try {
        const response = await fetch(`${API_BASE}/static-pages/${PAGE_SLUG}`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()

        if (!response.ok) {
            if (response.status === 404) {
                applyForm({
                    title: 'Homepage',
                    slug: PAGE_SLUG,
                    hero_title: 'Chào mừng đến với DuhocNB',
                    hero_description: 'Khám phá các dịch vụ và thông tin về DuhocNB.',
                    meta_title: 'Homepage - DuhocNB',
                    meta_description: 'Thông tin về trang chủ của DuhocNB.',
                    type: 'dynamic',
                    status: 'published',
                    content: ''
                })
                showWarning('Chưa có dữ liệu trong hệ thống. Đang sử dụng giá trị mặc định.')
                return
            }
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        applyForm(data?.data || {})
    } catch (error) {
        showError(error.message || 'Không thể tải nội dung trang')
    } finally {
        loading.value = false
    }
}

const savePageData = async () => {
    if (!validateForm()) {
        showError('Vui lòng kiểm tra lại thông tin trước khi lưu')
        return
    }

    saving.value = true
    try {
        const payload = {
            title: form.title.trim(),
            hero_title: (form.hero_title || '').trim(),
            hero_description: form.hero_description || '',
            meta_title: (form.meta_title || '').trim(),
            meta_description: form.meta_description || '',
            status: form.status,
            content: form.content || ''
        }

        const response = await fetch(`${API_BASE}/static-pages/${PAGE_SLUG}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        const data = await response.json()
        if (!response.ok) {
            if (data?.errors?.title) formErrors.title = data.errors.title
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        applyForm(data?.data || payload)
        showSuccess(data?.message || 'Đã lưu nội dung trang homepage thành công')
    } catch (error) {
        showError(error.message || 'Không thể lưu nội dung trang homepage')
    } finally {
        saving.value = false
    }
}

const restoreSnapshot = () => {
    if (!snapshot.value) return
    applyForm(snapshot.value)
    showSuccess('Đã khôi phục về nội dung gần nhất')
}

const previewPublicPage = () => {
    if (process.client) {
        window.open('/', '_blank')
    }
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await loadPageData()
    }
})
</script>

<style scoped>
.homepage-content-page {
    padding: 0;
    min-height: 100vh;
}

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
    max-width: 520px;
    padding: 3rem 2rem;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.loading-permission i {
    font-size: 3rem;
    color: #2196f3;
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
    font-size: 1.4rem;
}

.permission-denied p {
    color: #666;
    margin-bottom: 1.5rem;
    line-height: 1.5;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 1.5rem 0;
    border-bottom: 2px solid #eee;
}

.header-content h1 {
    color: #333;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 2rem;
}

.header-content h1 i {
    color: #1976d2;
}

.header-content p {
    margin: 0;
    color: #666;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.loading-state {
    padding: 3rem 2rem;
    text-align: center;
    color: #666;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.loading-state i {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #2196f3;
}

.form-layout {
    display: grid;
    gap: 1rem;
}

.content-section {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.section-header {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
}

.section-header h3 {
    margin: 0;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
}

.section-header p {
    margin: 0.4rem 0 0;
    color: #666;
    font-size: 0.92rem;
}

.form-grid {
    padding: 1.25rem;
    display: grid;
    gap: 1rem;
}

.two-columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
}

.form-group label {
    color: #333;
    font-weight: 600;
}

.form-control {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.7rem 0.8rem;
    font-size: 0.95rem;
    color: #333;
    background: #fff;
}

.form-control:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.14);
}

.form-control:disabled {
    background: #f4f5f7;
    color: #777;
}

.form-control.is-invalid {
    border-color: #dc3545;
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.15);
}

.content-editor {
    min-height: 320px;
    line-height: 1.5;
}

.field-hint {
    color: #6c757d;
    font-size: 0.82rem;
}

.field-error {
    margin: 0;
    color: #dc3545;
    font-size: 0.85rem;
}

.required {
    color: #dc3545;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 0.5rem 0 1rem;
}

.btn {
    padding: 0.75rem 1.1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    font-size: 0.92rem;
}

.btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
}

.btn-primary {
    background: #1976d2;
    color: #fff;
}

.btn-primary:hover:not(:disabled) {
    background: #1565c0;
}

.btn-secondary {
    background: #f0f2f5;
    color: #495057;
}

.btn-secondary:hover:not(:disabled) {
    background: #e7eaef;
}

.btn-outline {
    background: #fff;
    color: #1976d2;
    border: 1px solid #1976d2;
}

.btn-outline:hover:not(:disabled) {
    background: #e8f1fb;
}

@media (max-width: 992px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .header-actions {
        width: 100%;
        justify-content: flex-start;
    }

    .two-columns {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .header-content h1 {
        font-size: 1.45rem;
    }

    .form-grid,
    .section-header {
        padding: 1rem;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }
}
</style>