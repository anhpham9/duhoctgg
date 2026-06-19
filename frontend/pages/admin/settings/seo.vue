<template>
    <div class="settings-general-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Không thể truy cập Cài đặt chung</h3>
                <p>Chỉ Superadmin và Admin mới có thể cập nhật cài đặt hệ thống.</p>
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
                        <i class="fas fa-cogs"></i>
                        Cài đặt SEO
                    </h1>
                    <p>Quản lý thông tin SEO của website.</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" :disabled="loading || saving" @click="fetchSettings">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                        Làm mới
                    </button>
                    <button class="btn btn-primary" :disabled="saving || loading" @click="saveSettings">
                        <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                        {{ saving ? 'Đang lưu...' : 'Lưu cài đặt' }}
                    </button>
                </div>
            </div>

            <div v-if="loading" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải cài đặt...</p>
            </div>

            <div v-else-if="error" class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Lỗi: {{ error }}</p>
                <button @click="fetchSettings" class="btn btn-primary">Thử lại</button>
            </div>

            <div v-else class="settings-form">

                <div class="form-group">
                    <label>SEO Title mặc định</label>
                    <input
                        v-model="settings.seoDefaultTitle"
                        @input="clearFieldError('seoDefaultTitle')"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': !!formErrors.seoDefaultTitle }"
                        placeholder="Tiêu đề SEO mặc định"
                    >
                    <p v-if="formErrors.seoDefaultTitle" class="field-error">{{ formErrors.seoDefaultTitle }}</p>
                </div>

                <div class="form-group">
                    <label>SEO Description mặc định</label>
                    <textarea
                        v-model="settings.seoDefaultDescription"
                        @input="clearFieldError('seoDefaultDescription')"
                        class="form-control"
                        :class="{ 'is-invalid': !!formErrors.seoDefaultDescription }"
                        rows="3"
                        placeholder="Mô tả SEO mặc định"
                    ></textarea>
                    <p v-if="formErrors.seoDefaultDescription" class="field-error">{{ formErrors.seoDefaultDescription }}</p>
                </div>

                <div class="form-group">
                    <label>Default OG Image URL</label>
                    <input
                        v-model.trim="settings.seoDefaultOgImage"
                        @input="clearFieldError('seoDefaultOgImage')"
                        type="url"
                        class="form-control"
                        :class="{ 'is-invalid': !!formErrors.seoDefaultOgImage }"
                        placeholder="https://example.com/og-image.jpg"
                    >
                    <p v-if="formErrors.seoDefaultOgImage" class="field-error">{{ formErrors.seoDefaultOgImage }}</p>
                </div>

                <div class="form-group">
                    <label>Facebook App ID</label>
                    <input
                        v-model.trim="settings.seoFacebookAppId"
                        @input="clearFieldError('seoFacebookAppId')"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': !!formErrors.seoFacebookAppId }"
                        placeholder="123456789"
                    >
                    <p v-if="formErrors.seoFacebookAppId" class="field-error">{{ formErrors.seoFacebookAppId }}</p>
                </div>

                <div class="form-actions">
                    <button class="btn btn-secondary" :disabled="saving || loading" @click="resetForm">
                        <i class="fas fa-undo"></i>
                        Khôi phục
                    </button>
                    <button class="btn btn-primary" :disabled="saving || loading" @click="saveSettings">
                        <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                        {{ saving ? 'Đang lưu...' : 'Lưu cài đặt' }}
                    </button>
                </div>
            </div>
        </div>

        <Toast />
    </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { useNotifications } from '~/composables/useNotifications'

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'permission'],
    ssr: false
})

useHead({
    title: 'Cài đặt SEO - Admin'
})

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError, showInfo } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2]))

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const lastSavedData = ref(null)

const settings = reactive({
    seoDefaultTitle: '',
    seoDefaultDescription: '',
    seoDefaultOgImage: '',
    seoFacebookAppId: ''
})

const formErrors = reactive({
    seoDefaultTitle: '',
    seoDefaultDescription: '',
    seoDefaultOgImage: '',
    seoFacebookAppId: ''
})

const isValidUrl = (value) => {
    if (!value) return true
    try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
        return false
    }
}

const clearFieldError = (field) => {
    if (formErrors[field]) formErrors[field] = ''
}

const setSettings = (data = {}) => {
    settings.seoDefaultTitle = data.seoDefaultTitle || ''
    settings.seoDefaultDescription = data.seoDefaultDescription || ''
    settings.seoDefaultOgImage = data.seoDefaultOgImage || ''
    settings.seoFacebookAppId = data.seoFacebookAppId || ''
}

const clearAllErrors = () => {
    formErrors.seoDefaultTitle = ''
    formErrors.seoDefaultDescription = ''
    formErrors.seoDefaultOgImage = ''
    formErrors.seoFacebookAppId = ''
}

const validateForm = () => {
    clearAllErrors()

    if (settings.seoDefaultTitle.length > 255) {
        formErrors.seoDefaultTitle = 'SEO Title tối đa 255 ký tự'
    }

    if (settings.seoDefaultDescription.length > 2000) {
        formErrors.seoDefaultDescription = 'SEO Description tối đa 2000 ký tự'
    }

    if (settings.seoDefaultOgImage && !isValidUrl(settings.seoDefaultOgImage)) {
        formErrors.seoDefaultOgImage = 'OG Image URL không hợp lệ (http/https)'
    }

    if (settings.seoFacebookAppId.length > 100) {
        formErrors.seoFacebookAppId = 'Facebook App ID tối đa 100 ký tự'
    }

    return !Object.values(formErrors).some(Boolean)
}

const fetchSettings = async () => {
    loading.value = true
    error.value = ''

    try {
        const response = await fetch(`${API_BASE}/settings/seo`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        const payload = data?.data || {}
        setSettings(payload)
        lastSavedData.value = { ...payload }
    } catch (err) {
        error.value = err.message || 'Không thể tải cài đặt SEO'
    } finally {
        loading.value = false
    }
}

const saveSettings = async () => {
    if (!validateForm()) {
        showError('Vui lòng kiểm tra lại thông tin trước khi lưu')
        return
    }

    saving.value = true
    try {
        const payload = {
            seoDefaultTitle: settings.seoDefaultTitle || '',
            seoDefaultDescription: settings.seoDefaultDescription || '',
            seoDefaultOgImage: settings.seoDefaultOgImage || '',
            seoFacebookAppId: settings.seoFacebookAppId || ''
        }

        const response = await fetch(`${API_BASE}/settings/seo`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        const data = await response.json()

        if (!response.ok) {
            if (data?.errors) {
                formErrors.seoDefaultTitle = data.errors.seoDefaultTitle || ''
                formErrors.seoDefaultDescription = data.errors.seoDefaultDescription || ''
                formErrors.seoDefaultOgImage = data.errors.seoDefaultOgImage || ''
                formErrors.seoFacebookAppId = data.errors.seoFacebookAppId || ''
            }
            throw new Error(data?.message || 'Không thể lưu cài đặt')
        }

        const savedData = data?.data || payload
        setSettings(savedData)
        lastSavedData.value = { ...savedData }

        showSuccess(data?.message || 'Đã lưu cài đặt SEO thành công')
    } catch (err) {
        showError(err.message || 'Không thể lưu cài đặt SEO')
    } finally {
        saving.value = false
    }
}

const resetForm = () => {
    if (lastSavedData.value) {
        setSettings(lastSavedData.value)
        clearAllErrors()
        showInfo('Đã khôi phục dữ liệu gần nhất')
        return
    }

    setSettings({
        seoDefaultTitle: '',
        seoDefaultDescription: '',
        seoDefaultOgImage: '',
        seoFacebookAppId: ''
    })
    clearAllErrors()
    showInfo('Đã đặt lại form')
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await fetchSettings()
    }
})
</script>

<style scoped>
.settings-general-page {
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
    max-width: 500px;
    padding: 3rem 2rem;
    background: white;
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
    font-size: 1.5rem;
}

.permission-denied p {
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.5;
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
    color: #1976d2;
}

.header-content p {
    color: #666;
    margin: 0;
    font-size: 1.05rem;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.settings-form {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
}

.form-control {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
}

.form-control:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.14);
}

.form-control.is-invalid {
    border-color: #dc3545;
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.15);
}

.field-error {
    margin: 0.35rem 0 0;
    color: #dc3545;
    font-size: 0.85rem;
}

.maintenance-group {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0.9rem 1rem;
    background: #f8fafc;
}

.checkbox-label {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    font-weight: 600;
    color: #1f2937;
}

.help-text {
    margin: 0.4rem 0 0;
    color: #64748b;
    font-size: 0.9rem;
}

.required {
    color: #dc3545;
}

.loading-state,
.error-state {
    padding: 3rem 2rem;
    text-align: center;
    color: #666;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-state i {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #2196f3;
}

.error-state i {
    font-size: 2.5rem;
    color: #f59e0b;
    margin-bottom: 1rem;
}

.form-actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.btn {
    padding: 0.75rem 1.2rem;
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

@media (max-width: 1024px) {
    .page-header {
        flex-direction: column;
        gap: 1rem;
    }
}

@media (max-width: 768px) {
    .header-content h1 {
        font-size: 1.5rem;
    }

    .settings-form {
        padding: 1rem;
    }

    .header-actions,
    .form-actions {
        width: 100%;
        justify-content: stretch;
    }

    .header-actions .btn,
    .form-actions .btn {
        flex: 1;
        justify-content: center;
    }
}
</style>
