<template>
    <div class="news-form-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Dang kiem tra quyen truy cap...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Khong the truy cap Tao bai viet</h3>
                <p>Chi Superadmin, Admin, Manager va Editor moi co the tao tin tuc.</p>
                <NuxtLink to="/admin/news" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i>
                    Quay lai danh sach
                </NuxtLink>
            </div>
        </div>

        <div v-else class="form-wrapper">
            <div class="page-header">
                <div>
                    <h1><i class="fas fa-plus-circle"></i> Tao bai viet</h1>
                    <p>Nhap thong tin bai viet moi</p>
                </div>
                <NuxtLink to="/admin/news" class="btn btn-secondary">
                    <i class="fas fa-arrow-left"></i>
                    Quay lai
                </NuxtLink>
            </div>

            <form class="news-form" @submit.prevent="handleCreateNews">
                <div class="form-grid">
                    <div class="form-group full">
                        <label>Tieu de <span class="required">*</span></label>
                        <input v-model.trim="form.title" @input="clearFieldError('title')" @blur="handleTitleBlur" :class="['form-control', { 'is-invalid': !!formErrors.title }]" type="text" required placeholder="Nhap tieu de bai viet">
                        <p v-if="formErrors.title" class="field-error">{{ formErrors.title }}</p>
                    </div>

                    <div class="form-group">
                        <label>Slug</label>
                        <input v-model.trim="form.slug" @input="clearFieldError('slug')" @blur="validateField('slug')" :class="['form-control', { 'is-invalid': !!formErrors.slug }]" type="text" placeholder="de trong de tu tao">
                        <p v-if="formErrors.slug" class="field-error">{{ formErrors.slug }}</p>
                    </div>

                    <div class="form-group">
                        <label>Danh muc <span class="required">*</span></label>
                        <select v-model="form.category_id" @change="clearFieldError('category_id')" :class="['form-control', { 'is-invalid': !!formErrors.category_id }]">
                            <option :value="null">Chua phan loai</option>
                            <option v-for="category in categories" :key="category.id" :value="Number(category.id)">
                                {{ category.name }}
                            </option>
                        </select>
                        <p v-if="formErrors.category_id" class="field-error">{{ formErrors.category_id }}</p>
                    </div>

                    <div class="form-group" v-if="canManageStatus">
                        <label>Trang thai</label>
                        <select v-model="form.status" @change="handleStatusChange" :class="['form-control', { 'is-invalid': !!formErrors.status }]">
                            <option value="draft">Ban nhap</option>
                            <option value="published">Da xuat ban</option>
                            <option value="archived">Luu tru</option>
                        </select>
                        <p v-if="formErrors.status" class="field-error">{{ formErrors.status }}</p>
                    </div>

                    <div class="form-group" v-if="!canManageStatus">
                        <label>Trang thai</label>
                        <input class="form-control" type="text" value="Ban nhap (Editor)" disabled>
                    </div>

                    <div class="form-group" v-if="canManageStatus && form.status === 'published'">
                        <label>Ngay xuat ban</label>
                        <input v-model="form.published_at" @input="clearFieldError('published_at')" @blur="validateField('published_at')" :class="['form-control', { 'is-invalid': !!formErrors.published_at }]" type="datetime-local">
                        <p v-if="formErrors.published_at" class="field-error">{{ formErrors.published_at }}</p>
                    </div>

                    <div class="form-group full">
                        <label>Mo ta ngan <span class="required">*</span></label>
                        <textarea v-model.trim="form.excerpt" @input="clearFieldError('excerpt')" @blur="validateField('excerpt')" :class="['form-control', { 'is-invalid': !!formErrors.excerpt }]" rows="3" placeholder="Tom tat ngan gon ve bai viet"></textarea>
                        <p v-if="formErrors.excerpt" class="field-error">{{ formErrors.excerpt }}</p>
                    </div>

                    <div class="form-group full">
                        <label>Noi dung <span class="required">*</span></label>
                        <textarea v-model.trim="form.content" @input="clearFieldError('content')" @blur="validateField('content')" :class="['form-control', { 'is-invalid': !!formErrors.content }]" rows="12" required placeholder="Nhap noi dung bai viet"></textarea>
                        <p v-if="formErrors.content" class="field-error">{{ formErrors.content }}</p>
                    </div>

                    <div class="form-group">
                        <label>Thumbnail URL</label>
                        <input v-model.trim="form.thumbnail_url" @input="clearFieldError('thumbnail_url')" @blur="validateField('thumbnail_url')" :class="['form-control', { 'is-invalid': !!formErrors.thumbnail_url }]" type="url" placeholder="https://...">
                        <p v-if="formErrors.thumbnail_url" class="field-error">{{ formErrors.thumbnail_url }}</p>
                    </div>

                    <div class="form-group">
                        <label>Meta title</label>
                        <input v-model.trim="form.meta_title" @input="clearFieldError('meta_title')" @blur="validateField('meta_title')" :class="['form-control', { 'is-invalid': !!formErrors.meta_title }]" type="text" placeholder="Tieu de SEO">
                        <p v-if="formErrors.meta_title" class="field-error">{{ formErrors.meta_title }}</p>
                    </div>

                    <div class="form-group full">
                        <label>Meta description</label>
                        <textarea v-model.trim="form.meta_description" @input="clearFieldError('meta_description')" @blur="validateField('meta_description')" :class="['form-control', { 'is-invalid': !!formErrors.meta_description }]" rows="3" placeholder="Mo ta SEO"></textarea>
                        <p v-if="formErrors.meta_description" class="field-error">{{ formErrors.meta_description }}</p>
                    </div>
                </div>

                <div class="form-actions">
                    <NuxtLink to="/admin/news" class="btn btn-secondary">Huy</NuxtLink>
                    <button class="btn btn-primary" type="submit" :disabled="saving">
                        <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                        {{ saving ? 'Dang tao...' : 'Tao bai viet' }}
                    </button>
                </div>
            </form>
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
    title: 'Tao bai viet - Admin'
})

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2, 3, 4]))
const canManageStatus = computed(() => hasAnyRole([1, 2, 3]))

const categories = ref([])
const saving = ref(false)

const form = reactive({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    thumbnail_url: '',
    category_id: null,
    status: 'draft',
    published_at: '',
    meta_title: '',
    meta_description: ''
})

const formErrors = reactive({
    title: '',
    slug: '',
    category_id: '',
    status: '',
    published_at: '',
    excerpt: '',
    content: '',
    thumbnail_url: '',
    meta_title: '',
    meta_description: ''
})

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const toSlug = (text) => {
    return String(text || '')
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
}

const clearFieldError = (field) => {
    if (formErrors[field]) formErrors[field] = ''
}

const setBackendFieldErrors = (errors = {}) => {
    Object.keys(formErrors).forEach((key) => {
        formErrors[key] = errors?.[key] || ''
    })
}

const isValidHttpUrl = (value) => {
    try {
        const parsed = new URL(value)
        return ['http:', 'https:'].includes(parsed.protocol)
    } catch {
        return false
    }
}

const handleStatusChange = () => {
    clearFieldError('status')
    if (form.status !== 'published') {
        form.published_at = ''
        formErrors.published_at = ''
    }
}

const handleTitleBlur = () => {
    validateField('title')
    if (!form.slug.trim()) {
        form.slug = toSlug(form.title)
    }
    validateField('slug')
}

const validateField = (field) => {
    const title = form.title.trim()
    const content = form.content.trim()
    const slug = form.slug.trim()
    const excerpt = form.excerpt.trim()
    const thumbnail = form.thumbnail_url.trim()
    const metaTitle = form.meta_title.trim()
    const metaDescription = form.meta_description.trim()

    if (field === 'title') {
        if (!title) return (formErrors.title = 'Tieu de la bat buoc', false)
        if (title.length < 3) return (formErrors.title = 'Tieu de phai co it nhat 3 ky tu', false)
        if (title.length > 255) return (formErrors.title = 'Tieu de khong duoc vuot qua 255 ky tu', false)
        formErrors.title = ''
        return true
    }

    if (field === 'slug') {
        if (!slug) {
            formErrors.slug = ''
            return true
        }
        if (slug.length < 2) return (formErrors.slug = 'Slug phai co it nhat 2 ky tu', false)
        if (slug.length > 255) return (formErrors.slug = 'Slug khong duoc vuot qua 255 ky tu', false)
        if (!slugPattern.test(slug)) return (formErrors.slug = 'Slug chi gom chu thuong, so va dau gach ngang', false)
        formErrors.slug = ''
        return true
    }

    if (field === 'content') {
        if (!content) return (formErrors.content = 'Noi dung la bat buoc', false)
        if (content.length < 10) return (formErrors.content = 'Noi dung phai co it nhat 10 ky tu', false)
        if (content.length > 50000) return (formErrors.content = 'Noi dung khong duoc vuot qua 50000 ky tu', false)
        formErrors.content = ''
        return true
    }

    if (field === 'excerpt') {
        if (!excerpt) return (formErrors.excerpt = 'Mo ta ngan la bat buoc', false)
        if (excerpt.length > 500) return (formErrors.excerpt = 'Mo ta ngan khong duoc vuot qua 500 ky tu', false)
        formErrors.excerpt = ''
        return true
    }

    if (field === 'thumbnail_url') {
        if (!thumbnail) {
            formErrors.thumbnail_url = ''
            return true
        }
        if (!isValidHttpUrl(thumbnail)) return (formErrors.thumbnail_url = 'Thumbnail URL khong hop le (http/https)', false)
        formErrors.thumbnail_url = ''
        return true
    }

    if (field === 'meta_title') {
        if (metaTitle.length > 255) return (formErrors.meta_title = 'Meta title khong duoc vuot qua 255 ky tu', false)
        formErrors.meta_title = ''
        return true
    }

    if (field === 'meta_description') {
        if (metaDescription.length > 500) return (formErrors.meta_description = 'Meta description khong duoc vuot qua 500 ky tu', false)
        formErrors.meta_description = ''
        return true
    }

    if (field === 'published_at') {
        if (!form.published_at) {
            formErrors.published_at = ''
            return true
        }
        const d = new Date(form.published_at)
        if (isNaN(d.getTime())) return (formErrors.published_at = 'Ngay xuat ban khong hop le', false)
        formErrors.published_at = ''
        return true
    }

    if (field === 'status') {
        if (!['draft', 'published', 'archived'].includes(form.status)) {
            formErrors.status = 'Trang thai khong hop le'
            return false
        }
        formErrors.status = ''
        return true
    }

    if (field === 'category_id') {
        if (form.category_id === null || form.category_id === undefined || String(form.category_id).trim() === '') {
            formErrors.category_id = 'Danh muc la bat buoc'
            return false
        }
        if (!Number.isInteger(Number(form.category_id)) || Number(form.category_id) < 1) {
            formErrors.category_id = 'Danh muc khong hop le'
            return false
        }
        formErrors.category_id = ''
        return true
    }

    return true
}

const validateForm = () => {
    const fields = ['title', 'slug', 'content', 'excerpt', 'thumbnail_url', 'meta_title', 'meta_description', 'category_id']
    if (canManageStatus.value) fields.push('status', 'published_at')
    return fields.every((field) => validateField(field))
}

const fetchCategories = async () => {
    try {
        const response = await fetch(`${API_BASE}/categories`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (response.ok) {
            categories.value = data.data || []
        }
    } catch {
        categories.value = []
    }
}

const cleanPayload = () => {
    const payload = {
        title: form.title,
        content: form.content,
        slug: form.slug || undefined,
        excerpt: form.excerpt,
        thumbnail_url: form.thumbnail_url || undefined,
        category_id: form.category_id,
        meta_title: form.meta_title || form.title,
        meta_description: form.meta_description || form.excerpt
    }

    if (canManageStatus.value) {
        payload.status = form.status
        payload.published_at = form.published_at || undefined
    }

    return payload
}

const handleCreateNews = async () => {
    setBackendFieldErrors({})
    if (!validateForm()) {
        showError('Vui long kiem tra lai thong tin bai viet')
        return
    }

    saving.value = true
    try {
        const response = await fetch(`${API_BASE}/news`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleanPayload())
        })

        const data = await response.json()
        if (!response.ok) {
            if (data?.errors) {
                setBackendFieldErrors(data.errors)
            }
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        showSuccess(data?.message || 'Tao bai viet thanh cong')
        await navigateTo('/admin/news')
    } catch (err) {
        showError(err.message || 'Khong the tao bai viet')
    } finally {
        saving.value = false
    }
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await fetchCategories()
    }
})
</script>

<style scoped>
.news-form-page { padding: 0; min-height: 100vh; }
.form-wrapper { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 2px solid #eee; }
.page-header h1 { margin: 0 0 0.5rem 0; color: #333; display: flex; align-items: center; gap: 10px; }
.page-header p { margin: 0; color: #666; }
.news-form { margin-top: 1rem; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500; }
.form-control { width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 8px; font-size: 0.95rem; }
.form-control:focus { outline: none; border-color: #1976d2; }
.form-control.is-invalid { border-color: #dc3545; box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.15); }
textarea.form-control { resize: vertical; }
.field-error { margin: 0.4rem 0 0; color: #dc3545; font-size: 0.85rem; }
.required { color: #dc3545; }
.form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.btn { padding: 0.75rem 1.25rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; }
.btn-primary { background: #1976d2; color: white; }
.btn-secondary { background: #f5f5f5; color: #666; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.permission-check { display: flex; align-items: center; justify-content: center; min-height: 60vh; padding: 2rem; }
.loading-permission, .permission-denied { text-align: center; max-width: 500px; padding: 3rem 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.loading-permission i { font-size: 3rem; color: #2196f3; margin-bottom: 1rem; }
.permission-denied i { font-size: 3rem; color: #f44336; margin-bottom: 1rem; }
@media (max-width: 768px) {
    .form-grid { grid-template-columns: 1fr; }
    .form-wrapper { padding: 1rem; }
    .page-header { flex-direction: column; gap: 1rem; }
}
</style>