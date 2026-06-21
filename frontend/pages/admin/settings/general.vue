<template>
    <div class="settings-general-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Không thể truy cập Cài đặt</h3>
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
                    <p>Quản lý thông tin website và liên hệ theo từng nhóm.</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" :disabled="isLoading || saving" @click="fetchSettings">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
                        Làm mới
                    </button>
                    <button class="btn btn-primary" :disabled="saving || isLoading" @click="saveCurrentTab">
                        <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                        {{ saving ? 'Đang lưu...' : 'Lưu cài đặt' }}
                    </button>
                </div>
            </div>

            <div class="tabs">
                <button class="tab-btn" :class="{ active: activeTab === 'general' }" @click="activeTab = 'general'">
                    Thông tin website
                </button>
                <button class="tab-btn" :class="{ active: activeTab === 'contact' }" @click="activeTab = 'contact'">
                    Thông tin liên hệ
                </button>
            </div>

            <div v-if="isLoading" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải cài đặt...</p>
            </div>

            <div v-else-if="error" class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Lỗi: {{ error }}</p>
                <button @click="fetchSettings" class="btn btn-primary">Thử lại</button>
            </div>

            <div v-else class="settings-form">
                <template v-if="activeTab === 'general'">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Tên website <span class="required">*</span></label>
                            <input v-model.trim="generalSettings.siteName" @input="clearGeneralError('siteName')"
                                type="text" class="form-control" :class="{ 'is-invalid': !!generalErrors.siteName }"
                                placeholder="Nhập tên website">
                            <p v-if="generalErrors.siteName" class="field-error">{{ generalErrors.siteName }}</p>
                        </div>

                        <div class="form-group">
                            <label>Website link</label>
                            <input v-model.trim="generalSettings.siteUrl" @input="clearGeneralError('siteUrl')"
                                type="url" class="form-control" :class="{ 'is-invalid': !!generalErrors.siteUrl }"
                                placeholder="https://example.com">
                            <p v-if="generalErrors.siteUrl" class="field-error">{{ generalErrors.siteUrl }}</p>
                        </div>

                        <div class="form-group full">
                            <div class="form-split">
                                <div class="form-col">
                                    <label>Logo URL</label>
                                    <div class="input-mode-switch" role="group" aria-label="Logo input mode">
                                        <button type="button" class="mode-btn"
                                            :class="{ active: logoInputMode === 'url' }"
                                            @click="setImageInputMode('logo', 'url')">
                                            Nhập link ảnh
                                        </button>
                                        <button type="button" class="mode-btn"
                                            :class="{ active: logoInputMode === 'upload' }"
                                            @click="setImageInputMode('logo', 'upload')">
                                            Upload lên Cloudinary
                                        </button>
                                    </div>
                                    <input v-if="logoInputMode === 'url'" v-model.trim="generalSettings.siteLogoUrl"
                                        @input="clearGeneralError('siteLogoUrl')" type="url" class="form-control"
                                        :class="{ 'is-invalid': !!generalErrors.siteLogoUrl }"
                                        placeholder="https://example.com/logo.png">
                                    <div v-else class="upload-inline-actions">
                                        <input ref="logoFileInput" type="file"
                                            accept="image/png,image/jpeg,image/webp,image/gif" class="hidden-file-input"
                                            @change="onLogoFileChange">
                                        <button class="btn btn-secondary btn-upload-inline" type="button"
                                            :disabled="logoUploading || saving || isLoading" @click="triggerLogoPicker">
                                            <i class="fas"
                                                :class="logoUploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
                                            {{ logoUploading ? 'Đang upload logo...' : 'Upload logo' }}
                                        </button>
                                        <span class="upload-inline-hint">PNG/JPG/WEBP/GIF, tối đa 1MB. Ảnh chỉ upload
                                            khi bấm Lưu cài đặt.</span>
                                    </div>
                                    <p v-if="generalErrors.siteLogoUrl" class="field-error">{{ generalErrors.siteLogoUrl
                                        }}</p>
                                </div>
                                <div class="form-col">
                                    <div class="image-preview-card">
                                        <p class="image-preview-title">Xem trước Logo</p>
                                        <div class="image-preview-surface logo-preview-surface">
                                            <img v-if="logoPreviewSrc" :src="logoPreviewSrc" alt="Logo preview"
                                                class="image-preview">
                                            <p v-else class="image-preview-empty">Chưa có ảnh logo để xem trước</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="form-group full">
                            <div class="form-split">
                                <div class="form-col">
                                    <label>Favicon URL</label>
                                    <div class="input-mode-switch" role="group" aria-label="Favicon input mode">
                                        <button type="button" class="mode-btn"
                                            :class="{ active: faviconInputMode === 'url' }"
                                            @click="setImageInputMode('favicon', 'url')">
                                            Nhập link ảnh
                                        </button>
                                        <button type="button" class="mode-btn"
                                            :class="{ active: faviconInputMode === 'upload' }"
                                            @click="setImageInputMode('favicon', 'upload')">
                                            Upload lên Cloudinary
                                        </button>
                                    </div>
                                    <input v-if="faviconInputMode === 'url'"
                                        v-model.trim="generalSettings.siteFaviconUrl"
                                        @input="clearGeneralError('siteFaviconUrl')" type="url" class="form-control"
                                        :class="{ 'is-invalid': !!generalErrors.siteFaviconUrl }"
                                        placeholder="https://example.com/favicon.png">
                                    <div v-else class="upload-inline-actions">
                                        <input ref="faviconFileInput" type="file"
                                            accept=".ico,image/x-icon,image/vnd.microsoft.icon,image/png,image/jpeg,image/webp,image/gif"
                                            class="hidden-file-input" @change="onFaviconFileChange">
                                        <button class="btn btn-secondary btn-upload-inline" type="button"
                                            :disabled="faviconUploading || saving || isLoading"
                                            @click="triggerFaviconPicker">
                                            <i class="fas"
                                                :class="faviconUploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
                                            {{ faviconUploading ? 'Đang upload favicon...' : 'Upload favicon' }}
                                        </button>
                                        <span class="upload-inline-hint">ICO/PNG/JPG/WEBP/GIF, tối đa 0.5MB. Ảnh chỉ upload khi bấm Lưu cài đặt.</span>
                                        <p v-if="generalErrors.siteFaviconUrl" class="field-error">{{
                                            generalErrors.siteFaviconUrl
                                            }}
                                        </p>
                                    </div>
                                </div>
                                <div class="form-col">
                                    <div class="image-preview-card">
                                        <p class="image-preview-title">Xem trước Favicon</p>
                                        <div class="image-preview-surface favicon-preview-surface">
                                            <img v-if="faviconPreviewSrc" :src="faviconPreviewSrc" alt="Favicon preview"
                                                class="image-preview image-preview-favicon">
                                            <p v-else class="image-preview-empty">Chưa có ảnh favicon để xem trước</p>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>

                        <div class="form-group full">
                            <label>Mô tả website</label>
                            <textarea v-model="generalSettings.siteDescription"
                                @input="clearGeneralError('siteDescription')" class="form-control"
                                :class="{ 'is-invalid': !!generalErrors.siteDescription }" rows="3"
                                placeholder="Mô tả ngắn về website"></textarea>
                            <p v-if="generalErrors.siteDescription" class="field-error">{{ generalErrors.siteDescription
                            }}
                            </p>
                        </div>

                        <div class="form-group">
                            <label>Bản quyền</label>
                            <input v-model="generalSettings.siteCopyright" @input="clearGeneralError('siteCopyright')"
                                type="text" class="form-control"
                                :class="{ 'is-invalid': !!generalErrors.siteCopyright }"
                                placeholder="Bản quyền của website">
                            <p v-if="generalErrors.siteCopyright" class="field-error">{{ generalErrors.siteCopyright }}
                            </p>
                        </div>

                        <div class="form-group">
                            <label>Ngôn ngữ hệ thống</label>
                            <select v-model="generalSettings.siteLanguage" @change="clearGeneralError('siteLanguage')"
                                class="form-control" :class="{ 'is-invalid': !!generalErrors.siteLanguage }">
                                <option v-for="option in siteLanguageOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                            <p v-if="generalErrors.siteLanguage" class="field-error">{{ generalErrors.siteLanguage }}
                            </p>
                        </div>

                        <div class="form-group">
                            <label>Múi giờ hệ thống</label>
                            <select v-model="generalSettings.siteTimezone" @change="clearGeneralError('siteTimezone')"
                                class="form-control" :class="{ 'is-invalid': !!generalErrors.siteTimezone }">
                                <option v-for="option in siteTimezoneOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                            <p v-if="generalErrors.siteTimezone" class="field-error">{{ generalErrors.siteTimezone }}
                            </p>
                        </div>

                        <div class="form-group">
                            <label>Định dạng ngày</label>
                            <select v-model="generalSettings.dateFormat" @change="clearGeneralError('dateFormat')"
                                class="form-control" :class="{ 'is-invalid': !!generalErrors.dateFormat }">
                                <option v-for="option in dateFormatOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                            <p v-if="generalErrors.dateFormat" class="field-error">{{ generalErrors.dateFormat }}</p>
                        </div>
                    </div>
                </template>

                <template v-else>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Tên công ty đầy đủ</label>
                            <input v-model.trim="contactSettings.companyFullName"
                                @input="clearContactError('companyFullName')" type="text" class="form-control"
                                :class="{ 'is-invalid': !!contactErrors.companyFullName }"
                                placeholder="Ông ty Cổ phần ...">
                            <p v-if="contactErrors.companyFullName" class="field-error">{{ contactErrors.companyFullName
                                }}
                            </p>
                        </div>

                        <div class="form-group">
                            <label>Tên công ty dạng ngắn</label>
                            <input v-model.trim="contactSettings.companyShortName"
                                @input="clearContactError('companyShortName')" type="text" class="form-control"
                                :class="{ 'is-invalid': !!contactErrors.companyShortName }" placeholder="DuhocNB">
                            <p v-if="contactErrors.companyShortName" class="field-error">{{
                                contactErrors.companyShortName
                                }}</p>
                        </div>

                        <div class="form-group">
                            <label>Email liên hệ</label>
                            <input v-model.trim="contactSettings.contactEmail"
                                @input="clearContactError('contactEmail')" type="email" class="form-control"
                                :class="{ 'is-invalid': !!contactErrors.contactEmail }" placeholder="email@example.com">
                            <p v-if="contactErrors.contactEmail" class="field-error">{{ contactErrors.contactEmail }}
                            </p>
                        </div>

                        <div class="form-group">
                            <label>Số điện thoại</label>
                            <input v-model.trim="contactSettings.phone" @input="clearContactError('phone')" type="text"
                                class="form-control" :class="{ 'is-invalid': !!contactErrors.phone }"
                                placeholder="0123456789">
                            <p v-if="contactErrors.phone" class="field-error">{{ contactErrors.phone }}</p>
                        </div>

                        <div class="form-group">
                            <label>Hotline</label>
                            <input v-model.trim="contactSettings.hotline" @input="clearContactError('hotline')"
                                type="text" class="form-control" :class="{ 'is-invalid': !!contactErrors.hotline }"
                                placeholder="1900xxxx">
                            <p v-if="contactErrors.hotline" class="field-error">{{ contactErrors.hotline }}</p>
                        </div>

                        <div class="form-group">
                            <label>Địa chỉ</label>
                            <textarea v-model="contactSettings.address" @input="clearContactError('address')"
                                class="form-control" :class="{ 'is-invalid': !!contactErrors.address }" rows="2"
                                placeholder="Nhập địa chỉ"></textarea>
                            <p v-if="contactErrors.address" class="field-error">{{ contactErrors.address }}</p>
                        </div>

                        <div class="form-group">
                            <label>Google Maps embed URL</label>
                            <textarea v-model.trim="contactSettings.googleMapEmbedUrl"
                                @input="clearContactError('googleMapEmbedUrl')" class="form-control"
                                :class="{ 'is-invalid': !!contactErrors.googleMapEmbedUrl }" rows="4"
                                placeholder="https://www.google.com/maps/embed?..."></textarea>
                            <p v-if="contactErrors.googleMapEmbedUrl" class="field-error">{{
                                contactErrors.googleMapEmbedUrl
                                }}</p>
                        </div>

                        <div class="form-group">
                            <label>Giờ làm việc</label>
                            <textarea v-model="contactSettings.workingHours" @input="clearContactError('workingHours')"
                                class="form-control" :class="{ 'is-invalid': !!contactErrors.workingHours }" rows="2"
                                placeholder="Thứ 2 - Thứ 6: 8:00 - 18:00&#10;Thứ 7 - Chủ nhật: 9:00 - 17:00"></textarea>
                            <p v-if="contactErrors.workingHours" class="field-error">{{ contactErrors.workingHours }}
                            </p>
                        </div>

                        <div v-if="mapPreviewUrl" class="map-preview-card">
                            <p class="map-preview-title">Xem trước Google Maps</p>
                            <iframe :src="mapPreviewUrl" class="map-preview-iframe" allowfullscreen loading="lazy"
                                referrerpolicy="no-referrer-when-downgrade" title="Google Maps preview"></iframe>
                        </div>
                    </div>
                </template>

                <div class="form-actions">
                    <button class="btn btn-secondary" :disabled="saving || isLoading" @click="resetCurrentTab">
                        <i class="fas fa-undo"></i>
                        Khôi phục
                    </button>
                    <button class="btn btn-primary" :disabled="saving || isLoading" @click="saveCurrentTab">
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
import { onMounted, onBeforeUnmount, reactive, ref, computed } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { useNotifications } from '~/composables/useNotifications'
import { persistClientSiteSettings } from '~/utils/siteSettings'

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

const activeTab = ref('general')
const loadingGeneral = ref(false)
const loadingContact = ref(false)
const saving = ref(false)
const logoUploading = ref(false)
const faviconUploading = ref(false)
const error = ref('')
const logoFileInput = ref(null)
const faviconFileInput = ref(null)
const logoPreviewTempUrl = ref('')
const faviconPreviewTempUrl = ref('')
const pendingLogoFile = ref(null)
const pendingFaviconFile = ref(null)
const logoInputMode = ref('upload')
const faviconInputMode = ref('upload')
const siteLanguageOptions = [
    { value: 'vi', label: 'Tiếng Việt (vi)' },
    { value: 'en', label: 'English (en)' },
    { value: 'ja', label: '日本語 (ja)' }
]
const siteTimezoneOptions = [
    { value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho_Chi_Minh (GMT+7)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9)' },
    { value: 'UTC', label: 'UTC (GMT+0)' }
]
const dateFormatOptions = [
    { value: 'dd/mm/yyyy', label: 'dd/mm/yyyy' },
    { value: 'mm/dd/yyyy', label: 'mm/dd/yyyy' },
    { value: 'yyyy-mm-dd', label: 'yyyy-mm-dd' }
]

const generalSettings = reactive({
    siteName: '',
    siteUrl: '',
    siteLogoUrl: '',
    siteFaviconUrl: '',
    siteDescription: '',
    siteCopyright: '',
    siteLanguage: 'vi',
    siteTimezone: 'Asia/Ho_Chi_Minh',
    dateFormat: 'dd/mm/yyyy'
})

const contactSettings = reactive({
    companyFullName: '',
    companyShortName: '',
    contactEmail: '',
    phone: '',
    hotline: '',
    address: '',
    googleMapEmbedUrl: '',
    workingHours: ''
})

const generalErrors = reactive({
    siteName: '',
    siteUrl: '',
    siteLogoUrl: '',
    siteFaviconUrl: '',
    siteDescription: '',
    siteCopyright: '',
    siteLanguage: '',
    siteTimezone: '',
    dateFormat: ''
})

const contactErrors = reactive({
    companyFullName: '',
    companyShortName: '',
    contactEmail: '',
    phone: '',
    hotline: '',
    address: '',
    googleMapEmbedUrl: '',
    workingHours: ''
})

const lastSavedGeneral = ref(null)
const lastSavedContact = ref(null)

const isLoading = computed(() => loadingGeneral.value || loadingContact.value)
const logoPreviewSrc = computed(() => {
    return String(logoPreviewTempUrl.value || generalSettings.siteLogoUrl || '').trim()
})
const faviconPreviewSrc = computed(() => {
    return String(faviconPreviewTempUrl.value || generalSettings.siteFaviconUrl || '').trim()
})
const mapPreviewUrl = computed(() => {
    const rawValue = String(contactSettings.googleMapEmbedUrl || '').trim()
    if (!rawValue) return ''

    if (/^https?:\/\//i.test(rawValue)) {
        return rawValue
    }

    const srcMatch = rawValue.match(/src=["']([^"']+)["']/i)
    return srcMatch?.[1] || ''
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

const clearGeneralError = (field) => {
    if (generalErrors[field]) generalErrors[field] = ''
}

const clearContactError = (field) => {
    if (contactErrors[field]) contactErrors[field] = ''
}

const resetPreviewObjectUrl = (previewRef) => {
    if (!previewRef.value) return
    URL.revokeObjectURL(previewRef.value)
    previewRef.value = ''
}

const clearPendingLogoSelection = () => {
    pendingLogoFile.value = null
    resetPreviewObjectUrl(logoPreviewTempUrl)
}

const clearPendingFaviconSelection = () => {
    pendingFaviconFile.value = null
    resetPreviewObjectUrl(faviconPreviewTempUrl)
}

const clearPendingGeneralSelections = () => {
    clearPendingLogoSelection()
    clearPendingFaviconSelection()
}

const syncImageInputModesFromSettings = () => {
    logoInputMode.value = generalSettings.siteLogoUrl ? 'url' : 'upload'
    faviconInputMode.value = generalSettings.siteFaviconUrl ? 'url' : 'upload'
}

const setImageInputMode = (type, mode) => {
    if (!['url', 'upload'].includes(mode)) return

    if (type === 'logo') {
        logoInputMode.value = mode
        clearGeneralError('siteLogoUrl')
        if (mode === 'url') clearPendingLogoSelection()
    }

    if (type === 'favicon') {
        faviconInputMode.value = mode
        clearGeneralError('siteFaviconUrl')
        if (mode === 'url') clearPendingFaviconSelection()
    }
}

const triggerLogoPicker = () => {
    logoFileInput.value?.click()
}

const triggerFaviconPicker = () => {
    faviconFileInput.value?.click()
}

const uploadGeneralImageFile = async ({ file, imageType }) => {
    const fileType = String(file?.type || '').toLowerCase()
    const fileName = String(file?.name || '').toLowerCase()
    const isIcoFile = fileName.endsWith('.ico')
    const allowedTypes = imageType === 'favicon'
        ? ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon']
        : ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

    if (!allowedTypes.includes(fileType) && !(imageType === 'favicon' && isIcoFile)) {
        const allowedLabel = imageType === 'favicon'
            ? 'ICO/PNG/JPG/WEBP/GIF'
            : 'PNG/JPG/WEBP/GIF'
        throw new Error(`Định dạng file ${imageType} không hợp lệ (chỉ nhận ${allowedLabel})`)
    }

    const maxFileSize = imageType === 'favicon' ? 512 * 1024 : 1 * 1024 * 1024
    if (file.size > maxFileSize) {
        const maxFileSizeLabel = imageType === 'favicon' ? '0.5MB' : '1MB'
        throw new Error(`File ${imageType} vượt quá ${maxFileSizeLabel}`)
    }

    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', imageType)

    const response = await fetch(`${API_BASE}/settings/general/upload-image`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(data?.message || `Upload ${imageType} thất bại`)
    }

    const uploadedUrl = String(data?.data?.url || '').trim()
    if (!uploadedUrl) {
        throw new Error(`Không nhận được URL ${imageType} từ server`)
    }

    return {
        uploadedUrl,
        uploadedPublicId: String(data?.data?.publicId || '').trim(),
        data
    }
}

const rollbackUploadedGeneralImages = async (publicIds = []) => {
    const validPublicIds = publicIds.filter(Boolean)
    await Promise.all(validPublicIds.map((publicId) => fetch(`${API_BASE}/settings/general/upload-image`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId })
    }).catch(() => null)))
}

const onLogoFileChange = async (event) => {
    const file = event?.target?.files?.[0]
    event.target.value = ''

    if (!file) return

    const fileType = String(file?.type || '').toLowerCase()
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(fileType)) {
        showError('Định dạng file logo không hợp lệ (chỉ nhận PNG/JPG/WEBP/GIF)')
        return
    }

    if (file.size > 1 * 1024 * 1024) {
        showError('File logo vượt quá 1MB')
        return
    }

    resetPreviewObjectUrl(logoPreviewTempUrl)
    logoPreviewTempUrl.value = URL.createObjectURL(file)
    pendingLogoFile.value = file
    clearGeneralError('siteLogoUrl')
    showInfo('Logo đã được chọn. Ảnh sẽ chỉ upload khi bạn bấm Lưu cài đặt.')
}

const onFaviconFileChange = async (event) => {
    const file = event?.target?.files?.[0]
    event.target.value = ''

    if (!file) return

    const fileType = String(file?.type || '').toLowerCase()
    const fileName = String(file?.name || '').toLowerCase()
    const isIcoFile = fileName.endsWith('.ico')
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon']
    if (!allowedTypes.includes(fileType) && !isIcoFile) {
        showError('Định dạng file favicon không hợp lệ (chỉ nhận ICO/PNG/JPG/WEBP/GIF)')
        return
    }

    if (file.size > 512 * 1024) {
        showError('File favicon vượt quá 0.5MB')
        return
    }

    resetPreviewObjectUrl(faviconPreviewTempUrl)
    faviconPreviewTempUrl.value = URL.createObjectURL(file)
    pendingFaviconFile.value = file
    clearGeneralError('siteFaviconUrl')
    showInfo('Favicon đã được chọn. Ảnh sẽ chỉ upload khi bạn bấm Lưu cài đặt.')
}

const setGeneralSettings = (data = {}) => {
    generalSettings.siteName = data.siteName || ''
    generalSettings.siteUrl = data.siteUrl || ''
    generalSettings.siteLogoUrl = data.siteLogoUrl || ''
    generalSettings.siteFaviconUrl = data.siteFaviconUrl || ''
    generalSettings.siteDescription = data.siteDescription || ''
    generalSettings.siteCopyright = data.siteCopyright || ''
    generalSettings.siteLanguage = data.siteLanguage || 'vi'
    generalSettings.siteTimezone = data.siteTimezone || 'Asia/Ho_Chi_Minh'
    generalSettings.dateFormat = data.dateFormat || 'dd/mm/yyyy'
}

const setContactSettings = (data = {}) => {
    contactSettings.companyFullName = data.companyFullName || ''
    contactSettings.companyShortName = data.companyShortName || ''
    contactSettings.contactEmail = data.contactEmail || ''
    contactSettings.phone = data.phone || ''
    contactSettings.hotline = data.hotline || ''
    contactSettings.address = data.address || ''
    contactSettings.googleMapEmbedUrl = data.googleMapEmbedUrl || ''
    contactSettings.workingHours = data.workingHours || ''
}

const clearGeneralErrors = () => {
    generalErrors.siteName = ''
    generalErrors.siteUrl = ''
    generalErrors.siteLogoUrl = ''
    generalErrors.siteFaviconUrl = ''
    generalErrors.siteDescription = ''
    generalErrors.siteCopyright = ''
    generalErrors.siteLanguage = ''
    generalErrors.siteTimezone = ''
    generalErrors.dateFormat = ''
}

const clearContactErrors = () => {
    contactErrors.companyFullName = ''
    contactErrors.companyShortName = ''
    contactErrors.contactEmail = ''
    contactErrors.phone = ''
    contactErrors.hotline = ''
    contactErrors.address = ''
    contactErrors.googleMapEmbedUrl = ''
    contactErrors.workingHours = ''
}

const validateGeneral = () => {
    clearGeneralErrors()

    if (!generalSettings.siteName.trim()) {
        generalErrors.siteName = 'Tên website là bắt buộc'
    }

    if (generalSettings.siteDescription.length > 2000) {
        generalErrors.siteDescription = 'Mô tả website tối đa 2000 ký tự'
    }

    if (generalSettings.siteCopyright.length > 255) {
        generalErrors.siteCopyright = 'Bản quyền tối đa 255 ký tự'
    }

    if (generalSettings.siteUrl && !isValidUrl(generalSettings.siteUrl)) {
        generalErrors.siteUrl = 'Website link không hợp lệ (cần bắt đầu bằng http/https)'
    }

    if (!siteLanguageOptions.some((option) => option.value === generalSettings.siteLanguage)) {
        generalErrors.siteLanguage = 'Ngôn ngữ hệ thống không hợp lệ'
    }

    if (!siteTimezoneOptions.some((option) => option.value === generalSettings.siteTimezone)) {
        generalErrors.siteTimezone = 'Múi giờ hệ thống không hợp lệ'
    }

    if (!dateFormatOptions.some((option) => option.value === generalSettings.dateFormat)) {
        generalErrors.dateFormat = 'Định dạng ngày không hợp lệ'
    }

    if (logoInputMode.value === 'url') {
        if (generalSettings.siteLogoUrl && !isValidUrl(generalSettings.siteLogoUrl)) {
            generalErrors.siteLogoUrl = 'Logo URL không hợp lệ (cần bắt đầu bằng http/https)'
        }
    } else if (!pendingLogoFile.value && !generalSettings.siteLogoUrl) {
        generalErrors.siteLogoUrl = 'Bạn phải chọn ảnh logo để upload hoặc chuyển sang chế độ nhập link'
    }

    if (faviconInputMode.value === 'url') {
        if (generalSettings.siteFaviconUrl && !isValidUrl(generalSettings.siteFaviconUrl)) {
            generalErrors.siteFaviconUrl = 'Favicon URL không hợp lệ (cần bắt đầu bằng http/https)'
        }
    } else if (!pendingFaviconFile.value && !generalSettings.siteFaviconUrl) {
        generalErrors.siteFaviconUrl = 'Bạn phải chọn ảnh favicon để upload hoặc chuyển sang chế độ nhập link'
    }

    return !Object.values(generalErrors).some(Boolean)
}

const validateContact = () => {
    clearContactErrors()

    if (contactSettings.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactSettings.contactEmail)) {
        contactErrors.contactEmail = 'Email không hợp lệ'
    }

    if (contactSettings.phone && !/^[0-9+()\-\s]{8,20}$/.test(contactSettings.phone)) {
        contactErrors.phone = 'Số điện thoại không hợp lệ'
    }

    if (contactSettings.hotline && !/^[0-9+()\-\s]{8,20}$/.test(contactSettings.hotline)) {
        contactErrors.hotline = 'Hotline không hợp lệ'
    }

    if (contactSettings.address.length > 1000) {
        contactErrors.address = 'Địa chỉ tối đa 1000 ký tự'
    }

    if (contactSettings.googleMapEmbedUrl && !isValidUrl(contactSettings.googleMapEmbedUrl)) {
        contactErrors.googleMapEmbedUrl = 'Google Maps URL không hợp lệ (cần bắt đầu bằng http/https)'
    }

    if (contactSettings.workingHours.length > 500) {
        contactErrors.workingHours = 'Giờ làm việc tối đa 500 ký tự'
    }

    return !Object.values(contactErrors).some(Boolean)
}

const fetchGeneralSettings = async () => {
    loadingGeneral.value = true
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
        setGeneralSettings(payload)
        lastSavedGeneral.value = { ...payload }
        persistClientSiteSettings(payload)
        clearPendingGeneralSelections()
        syncImageInputModesFromSettings()
    } finally {
        loadingGeneral.value = false
    }
}

const fetchContactSettings = async () => {
    loadingContact.value = true
    try {
        const response = await fetch(`${API_BASE}/settings/contact`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        const payload = data?.data || {}
        setContactSettings(payload)
        lastSavedContact.value = { ...payload }
    } finally {
        loadingContact.value = false
    }
}

const fetchSettings = async () => {
    error.value = ''
    try {
        await Promise.all([fetchGeneralSettings(), fetchContactSettings()])
    } catch (err) {
        error.value = err.message || 'Không thể tải cài đặt'
    }
}

const saveGeneralSettings = async () => {
    if (!validateGeneral()) {
        showError('Vui lòng kiểm tra lại thông tin tab website')
        return
    }

    const uploadedPublicIds = []

    try {
        const payload = {
            siteName: generalSettings.siteName.trim(),
            siteUrl: generalSettings.siteUrl.trim(),
            siteLogoUrl: generalSettings.siteLogoUrl.trim(),
            siteFaviconUrl: generalSettings.siteFaviconUrl.trim(),
            siteDescription: generalSettings.siteDescription || '',
            siteCopyright: generalSettings.siteCopyright || '',
            siteLanguage: generalSettings.siteLanguage,
            siteTimezone: generalSettings.siteTimezone,
            dateFormat: generalSettings.dateFormat
        }

        if (logoInputMode.value === 'upload') {
            payload.siteLogoUrl = pendingLogoFile.value ? payload.siteLogoUrl : String(generalSettings.siteLogoUrl || '').trim()
        }

        if (faviconInputMode.value === 'upload') {
            payload.siteFaviconUrl = pendingFaviconFile.value ? payload.siteFaviconUrl : String(generalSettings.siteFaviconUrl || '').trim()
        }

        if (pendingLogoFile.value) {
            logoUploading.value = true
            const { uploadedUrl, uploadedPublicId } = await uploadGeneralImageFile({ file: pendingLogoFile.value, imageType: 'logo' })
            payload.siteLogoUrl = uploadedUrl
            if (uploadedPublicId) uploadedPublicIds.push(uploadedPublicId)
            payload.siteLogoAssetPublicId = uploadedPublicId || ''
        }

        if (pendingFaviconFile.value) {
            faviconUploading.value = true
            const { uploadedUrl, uploadedPublicId } = await uploadGeneralImageFile({ file: pendingFaviconFile.value, imageType: 'favicon' })
            payload.siteFaviconUrl = uploadedUrl
            if (uploadedPublicId) uploadedPublicIds.push(uploadedPublicId)
            payload.siteFaviconAssetPublicId = uploadedPublicId || ''
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
                generalErrors.siteName = data.errors.siteName || ''
                generalErrors.siteUrl = data.errors.siteUrl || ''
                generalErrors.siteLogoUrl = data.errors.siteLogoUrl || ''
                generalErrors.siteFaviconUrl = data.errors.siteFaviconUrl || ''
                generalErrors.siteDescription = data.errors.siteDescription || ''
                generalErrors.siteCopyright = data.errors.siteCopyright || ''
                generalErrors.siteLanguage = data.errors.siteLanguage || ''
                generalErrors.siteTimezone = data.errors.siteTimezone || ''
                generalErrors.dateFormat = data.errors.dateFormat || ''
            }
            throw new Error(data?.message || 'Không thể lưu cài đặt website')
        }

        const savedData = data?.data || payload
        setGeneralSettings(savedData)
        lastSavedGeneral.value = { ...savedData }
        persistClientSiteSettings(savedData)
        clearPendingGeneralSelections()
        showSuccess(data?.message || 'Đã lưu cài đặt website thành công')
    } catch (err) {
        await rollbackUploadedGeneralImages(uploadedPublicIds)
        throw err
    } finally {
        logoUploading.value = false
        faviconUploading.value = false
    }
}

const saveContactSettings = async () => {
    if (!validateContact()) {
        showError('Vui lòng kiểm tra lại thông tin tab liên hệ')
        return
    }

    const payload = {
        companyFullName: contactSettings.companyFullName.trim(),
        companyShortName: contactSettings.companyShortName.trim(),
        contactEmail: contactSettings.contactEmail.trim(),
        phone: contactSettings.phone.trim(),
        hotline: contactSettings.hotline.trim(),
        address: contactSettings.address || '',
        googleMapEmbedUrl: contactSettings.googleMapEmbedUrl.trim(),
        workingHours: contactSettings.workingHours || ''
    }

    const response = await fetch(`${API_BASE}/settings/contact`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    const data = await response.json()

    if (!response.ok) {
        if (data?.errors) {
            contactErrors.companyFullName = data.errors.companyFullName || ''
            contactErrors.companyShortName = data.errors.companyShortName || ''
            contactErrors.contactEmail = data.errors.contactEmail || ''
            contactErrors.phone = data.errors.phone || ''
            contactErrors.hotline = data.errors.hotline || ''
            contactErrors.address = data.errors.address || ''
            contactErrors.googleMapEmbedUrl = data.errors.googleMapEmbedUrl || ''
            contactErrors.workingHours = data.errors.workingHours || ''
        }
        throw new Error(data?.message || 'Không thể lưu cài đặt liên hệ')
    }

    const savedData = data?.data || payload
    setContactSettings(savedData)
    lastSavedContact.value = { ...savedData }
    showSuccess(data?.message || 'Đã lưu cài đặt liên hệ thành công')
}

const saveCurrentTab = async () => {
    saving.value = true
    try {
        if (activeTab.value === 'general') {
            await saveGeneralSettings()
        } else {
            await saveContactSettings()
        }
    } catch (err) {
        showError(err.message || 'Không thể lưu cài đặt')
    } finally {
        saving.value = false
    }
}

const resetCurrentTab = () => {
    if (activeTab.value === 'general') {
        if (lastSavedGeneral.value) {
            setGeneralSettings(lastSavedGeneral.value)
            clearGeneralErrors()
            clearPendingGeneralSelections()
            syncImageInputModesFromSettings()
            showInfo('Đã khôi phục dữ liệu tab website')
            return
        }

        setGeneralSettings({
            siteName: '',
            siteUrl: '',
            siteLogoUrl: '',
            siteFaviconUrl: '',
            siteDescription: '',
            siteCopyright: '',
            siteLanguage: 'vi',
            siteTimezone: 'Asia/Ho_Chi_Minh',
            dateFormat: 'dd/mm/yyyy'
        })
        clearGeneralErrors()
        clearPendingGeneralSelections()
        syncImageInputModesFromSettings()
        showInfo('Đã đặt lại tab website')
        return
    }

    if (lastSavedContact.value) {
        setContactSettings(lastSavedContact.value)
        clearContactErrors()
        showInfo('Đã khôi phục dữ liệu tab liên hệ')
        return
    }

    setContactSettings({
        companyFullName: '',
        companyShortName: '',
        contactEmail: '',
        phone: '',
        hotline: '',
        address: '',
        googleMapEmbedUrl: '',
        workingHours: ''
    })
    clearContactErrors()
    showInfo('Đã đặt lại tab liên hệ')
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await fetchSettings()
    }
})

onBeforeUnmount(() => {
    resetPreviewObjectUrl(logoPreviewTempUrl)
    resetPreviewObjectUrl(faviconPreviewTempUrl)
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

.tabs {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.tab-btn {
    border: 1px solid #d1d5db;
    background: #fff;
    color: #334155;
    border-radius: 8px;
    padding: 0.55rem 0.9rem;
    font-weight: 600;
    cursor: pointer;
}

.tab-btn.active {
    background: #1976d2;
    border-color: #1976d2;
    color: #fff;
}

.settings-form {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group.full {
    grid-column: 1 / -1;
}

.form-row {
    grid-column: 1 / -1;

    display: flex;
    align-items: center;
    gap: 12px;
}

.form-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.form-col {
    min-width: 0;
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

.input-mode-switch {
    display: inline-flex;
    gap: 0.4rem;
    margin-bottom: 0.55rem;
    padding: 0.2rem;
    border-radius: 10px;
    background: #eff4fb;
    border: 1px solid #d4e2f4;
}

.mode-btn {
    border: 0;
    background: transparent;
    color: #27466b;
    padding: 0.38rem 0.66rem;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
}

.mode-btn.active {
    background: #1976d2;
    color: #fff;
}

.upload-inline-actions {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;
}

.hidden-file-input {
    display: none;
}

.btn-upload-inline {
    padding: 0.5rem 0.75rem;
    font-size: 0.82rem;
}

.upload-inline-hint {
    color: #64748b;
    font-size: 0.82rem;
}

.image-preview-card {
    margin-top: 0.6rem;
    border: 1px solid #dbe6f5;
    border-radius: 10px;
    background: #f8fbff;
    padding: 0.75rem;
}

.image-preview-title {
    margin: 0 0 0.55rem;
    color: #18477d;
    font-size: 0.9rem;
    font-weight: 600;
}

.image-preview-surface {
    border: 1px dashed #bdd0ea;
    border-radius: 8px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem;
}

.logo-preview-surface {
    min-height: 140px;
}

.favicon-preview-surface {
    min-height: 96px;
}

.image-preview {
    max-width: 100%;
    max-height: 120px;
    object-fit: contain;
}

.image-preview-favicon {
    max-width: 64px;
    max-height: 64px;
}

.image-preview-empty {
    margin: 0;
    color: #64748b;
    font-size: 0.85rem;
}

.field-error {
    margin: 0.35rem 0 0;
    color: #dc3545;
    font-size: 0.85rem;
}

.map-preview-card {
    margin-top: 0.75rem;
    border: 1px solid #dbe6f5;
    border-radius: 10px;
    background: #f8fbff;
    padding: 0.85rem;
}

.map-preview-title {
    margin: 0 0 0.6rem;
    color: #18477d;
    font-size: 0.9rem;
    font-weight: 600;
}

.map-preview-iframe {
    width: 100%;
    height: 320px;
    border: 0;
    border-radius: 8px;
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

    .map-preview-iframe {
        height: 260px;
    }

    .tabs {
        flex-direction: column;
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
