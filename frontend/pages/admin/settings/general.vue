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
                        Cài đặt chung
                    </h1>
                    <p>Quản lý thông tin cơ bản của website.</p>
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
                    <label>Tên website <span class="required">*</span></label>
                    <input
                        v-model.trim="settings.siteName"
                        @input="clearFieldError('siteName')"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': !!formErrors.siteName }"
                        placeholder="Nhập tên website"
                    >
                    <p v-if="formErrors.siteName" class="field-error">{{ formErrors.siteName }}</p>
                </div>

                <div class="form-group">
                    <label>Logo URL</label>
                    <input
                        v-model.trim="settings.siteLogoUrl"
                        @input="clearFieldError('siteLogoUrl')"
                        type="url"
                        class="form-control"
                        :class="{ 'is-invalid': !!formErrors.siteLogoUrl }"
                        placeholder="https://example.com/logo.png"
                    >
                    <p v-if="formErrors.siteLogoUrl" class="field-error">{{ formErrors.siteLogoUrl }}</p>
                </div>

                <div class="form-group">
                    <label>Favicon URL</label>
                    <input
                        v-model.trim="settings.siteFaviconUrl"
                        @input="clearFieldError('siteFaviconUrl')"
                        type="url"
                        class="form-control"
                        :class="{ 'is-invalid': !!formErrors.siteFaviconUrl }"
                        placeholder="https://example.com/favicon.png"
                    >
                    <p v-if="formErrors.siteFaviconUrl" class="field-error">{{ formErrors.siteFaviconUrl }}</p>
                </div>

                <div class="form-group">
                    <label>Mô tả website</label>
                    <textarea
                        v-model="settings.siteDescription"
                        @input="clearFieldError('siteDescription')"
                        class="form-control"
                        :class="{ 'is-invalid': !!formErrors.siteDescription }"
                        rows="3"
                        placeholder="Mô tả ngắn về website"
                    ></textarea>
                    <p v-if="formErrors.siteDescription" class="field-error">{{ formErrors.siteDescription }}</p>
                </div>

                <div class="form-group">
                    <label>Email liên hệ</label>
                    <input
                        v-model.trim="settings.contactEmail"
                        @input="clearFieldError('contactEmail')"
                        type="email"
                        class="form-control"
                        :class="{ 'is-invalid': !!formErrors.contactEmail }"
                        placeholder="email@example.com"
                    >
                    <p v-if="formErrors.contactEmail" class="field-error">{{ formErrors.contactEmail }}</p>
                </div>

                <div class="form-group">
                    <label>Số điện thoại</label>
                    <input
                        v-model.trim="settings.phone"
                        @input="clearFieldError('phone')"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': !!formErrors.phone }"
                        placeholder="0123456789"
                    >
                    <p v-if="formErrors.phone" class="field-error">{{ formErrors.phone }}</p>
                </div>

                <div class="form-group">
                    <label>Hotline</label>
                    <input
                        v-model.trim="settings.hotline"
                        @input="clearFieldError('hotline')"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': !!formErrors.hotline }"
                        placeholder="1900xxxx"
                    >
                    <p v-if="formErrors.hotline" class="field-error">{{ formErrors.hotline }}</p>
                </div>

                <div class="form-group">
                    <label>Địa chỉ</label>
                    <textarea
                        v-model="settings.address"
                        @input="clearFieldError('address')"
                        class="form-control"
                        :class="{ 'is-invalid': !!formErrors.address }"
                        rows="2"
                        placeholder="Nhập địa chỉ"
                    ></textarea>
                    <p v-if="formErrors.address" class="field-error">{{ formErrors.address }}</p>
                </div>

                <div class="form-group">
                    <label>iframe google map</label>
                    <input
                        v-model="settings.googleMapIframe"
                        @input="clearFieldError('googleMapIframe')"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': !!formErrors.googleMapIframe }"
                        placeholder="Nhập iframe Google Map"
                    >
                    <p v-if="formErrors.googleMapIframe" class="field-error">{{ formErrors.googleMapIframe }}</p>
                </div>

                <div class="form-group maintenance-group">
                    <label class="checkbox-label">
                        <input
                            v-model="settings.maintenanceMode"
                            @change="clearFieldError('maintenanceMode')"
                            type="checkbox"
                        >
                        <span>Bật chế độ bảo trì</span>
                    </label>
                    <p class="help-text">Khi bật, website có thể hiển thị thông báo bảo trì cho người dùng.</p>
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
    title: 'Cài đặt chung - Admin'
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
    siteName: '',
    siteLogoUrl: '',
    siteFaviconUrl: '',
    siteDescription: '',
    contactEmail: '',
    phone: '',
    hotline: '',
    address: '',
    googleMapIframe: '',
    maintenanceMode: false
})

const formErrors = reactive({
    siteName: '',
    siteLogoUrl: '',
    siteFaviconUrl: '',
    siteDescription: '',
    contactEmail: '',
    phone: '',
    hotline: '',
    address: '',
    googleMapIframe: '',
    maintenanceMode: ''
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
    settings.siteName = data.siteName || ''
    settings.siteLogoUrl = data.siteLogoUrl || ''
    settings.siteFaviconUrl = data.siteFaviconUrl || ''
    settings.siteDescription = data.siteDescription || ''
    settings.contactEmail = data.contactEmail || ''
    settings.phone = data.phone || ''
    settings.hotline = data.hotline || ''
    settings.address = data.address || ''
    settings.googleMapIframe = data.googleMapIframe || ''
    settings.maintenanceMode = Boolean(data.maintenanceMode)
}

const clearAllErrors = () => {
    formErrors.siteName = ''
    formErrors.siteLogoUrl = ''
    formErrors.siteFaviconUrl = ''
    formErrors.siteDescription = ''
    formErrors.contactEmail = ''
    formErrors.phone = ''
    formErrors.hotline = ''
    formErrors.address = ''
    formErrors.googleMapIframe = ''
    formErrors.maintenanceMode = ''
}

const validateForm = () => {
    clearAllErrors()

    if (!settings.siteName.trim()) {
        formErrors.siteName = 'Tên website là bắt buộc'
    }

    if (settings.siteDescription.length > 2000) {
        formErrors.siteDescription = 'Mô tả website tối đa 2000 ký tự'
    }

    if (settings.siteLogoUrl && !isValidUrl(settings.siteLogoUrl)) {
        formErrors.siteLogoUrl = 'Logo URL không hợp lệ (cần bắt đầu bằng http/https)'
    }

    if (settings.siteFaviconUrl && !isValidUrl(settings.siteFaviconUrl)) {
        formErrors.siteFaviconUrl = 'Favicon URL không hợp lệ (cần bắt đầu bằng http/https)'
    }

    if (settings.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contactEmail)) {
        formErrors.contactEmail = 'Email không hợp lệ'
    }

    if (settings.phone && !/^[0-9+()\-\s]{8,20}$/.test(settings.phone)) {
        formErrors.phone = 'Số điện thoại không hợp lệ'
    }

    if (settings.hotline && !/^[0-9+()\-\s]{8,20}$/.test(settings.hotline)) {
        formErrors.hotline = 'Hotline không hợp lệ'
    }

    if (settings.address.length > 1000) {
        formErrors.address = 'Địa chỉ tối đa 1000 ký tự'
    }

    return !Object.values(formErrors).some(Boolean)
}

const fetchSettings = async () => {
    loading.value = true
    error.value = ''

    try {
        const response = await fetch(`${API_BASE}/settings/general`, {
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
        error.value = err.message || 'Không thể tải cài đặt chung'
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
            siteName: settings.siteName.trim(),
            siteLogoUrl: settings.siteLogoUrl.trim(),
            siteFaviconUrl: settings.siteFaviconUrl.trim(),
            siteDescription: settings.siteDescription || '',
            contactEmail: settings.contactEmail.trim(),
            phone: settings.phone.trim(),
            hotline: settings.hotline.trim(),
            address: settings.address || '',
            googleMapIframe: settings.googleMapIframe || '',
            maintenanceMode: Boolean(settings.maintenanceMode)
        }

        const response = await fetch(`${API_BASE}/settings/general`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        const data = await response.json()

        if (!response.ok) {
            if (data?.errors) {
                formErrors.siteName = data.errors.siteName || ''
                formErrors.siteLogoUrl = data.errors.siteLogoUrl || ''
                formErrors.siteFaviconUrl = data.errors.siteFaviconUrl || ''
                formErrors.contactEmail = data.errors.contactEmail || ''
                formErrors.phone = data.errors.phone || ''
                formErrors.hotline = data.errors.hotline || ''
                formErrors.address = data.errors.address || ''
                formErrors.googleMapIframe = data.errors.googleMapIframe || ''
            }
            throw new Error(data?.message || 'Không thể lưu cài đặt')
        }

        const savedData = data?.data || payload
        setSettings(savedData)
        lastSavedData.value = { ...savedData }

        showSuccess(data?.message || 'Đã lưu cài đặt chung thành công')
    } catch (err) {
        showError(err.message || 'Không thể lưu cài đặt chung')
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
        siteName: '',
        siteLogoUrl: '',
        siteFaviconUrl: '',
        siteDescription: '',
        contactEmail: '',
        phone: '',
        hotline: '',
        address: '',
        googleMapIframe: '',
        maintenanceMode: false
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

.settings-links {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 2px solid #eee;
}

.section-label {
    color: #555;
    font-weight: 600;
    margin-bottom: 1rem;
    display: block;
}

.settings-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.2rem;
    margin-right: 0.75rem;
    margin-bottom: 0.75rem;
    background: #f0f7ff;
    color: #1976d2;
    text-decoration: none;
    border-radius: 6px;
    border: 1px solid #1976d2;
    transition: all 0.2s ease;
    font-weight: 500;
}

.settings-link:hover {
    background: #1976d2;
    color: white;
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

    .settings-links {
        flex-direction: column;
    }

    .settings-link {
        width: 100%;
        text-align: center;
    }
}
</style>
