<template>
    <div class="popup-campaigns-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Không thể truy cập Popup quảng cáo</h3>
                <p>Chỉ Superadmin và Admin mới có thể quản lý popup quảng cáo.</p>
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
                        <i class="fas fa-images"></i>
                        Popup quảng cáo
                    </h1>
                    <p>Quản lý popup theo trang, vị trí hiển thị và thời gian hiệu lực.</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" :disabled="loading || saving" @click="fetchCampaigns">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                        Làm mới
                    </button>
                    <button class="btn btn-success" :disabled="saving" @click="openCreateForm">
                        <i class="fas fa-plus"></i>
                        Thêm popup
                    </button>
                </div>
            </div>

            <div v-if="loading" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải popup...</p>
            </div>

            <div v-else-if="error" class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Lỗi: {{ error }}</p>
                <button @click="fetchCampaigns" class="btn btn-primary">Thử lại</button>
            </div>

            <div v-else class="table-container">
                <table v-if="campaigns.length" class="table">
                    <thead>
                        <tr>
                            <th>Tiêu đề</th>
                            <th>Trang / Vị trí</th>
                            <th>Ưu tiên</th>
                            <th>Lịch hiển thị</th>
                            <th>Đóng popup</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in campaigns" :key="item.id">
                            <td>
                                <div class="campaign-title">{{ item.title }}</div>
                                <a v-if="item.link" :href="item.link" target="_blank" rel="noopener" class="campaign-link">
                                    {{ item.link }}
                                </a>
                            </td>
                            <td>
                                <div>{{ pageLabel(item.page) }}</div>
                                <small>{{ positionLabel(item.position) }}</small>
                            </td>
                            <td>{{ item.priority }}</td>
                            <td>
                                <div>{{ formatDateTime(item.start_at) || 'Ngay' }}</div>
                                <small>→ {{ formatDateTime(item.end_at) || 'Vo thoi han' }}</small>
                            </td>
                            <td>{{ closeTypeLabel(item.close_type) }}</td>
                            <td>
                                <span class="badge" :class="item.is_active ? 'badge-success' : 'badge-danger'">
                                    {{ item.is_active ? 'Kích hoạt' : 'Tạm dừng' }}
                                </span>
                            </td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn btn-sm btn-secondary" :disabled="saving" @click="openEditForm(item)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" :disabled="saving" @click="deleteCampaign(item)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-else class="empty-state">
                    <i class="fas fa-image"></i>
                    <p>Chưa có popup quảng cáo nào</p>
                </div>
            </div>
        </div>

        <div v-if="showForm" class="modal-overlay">
            <div class="modal-card" @click.stop>
                <div class="modal-header">
                    <h3>{{ editingId ? 'Cập nhật popup' : 'Tạo popup mới' }}</h3>
                    <button type="button" class="btn-close" @click="closeForm">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <form class="modal-body" @submit.prevent="saveCampaign">
                    <div class="form-grid">
                        <div class="form-group full">
                            <label>Tiêu đề <span class="required">*</span></label>
                            <input v-model.trim="form.title" type="text" class="form-control" :class="{ 'is-invalid': !!errors.title }">
                            <p v-if="errors.title" class="field-error">{{ errors.title }}</p>
                        </div>

                        <div class="form-group full">
                            <div class="form-split">
                                <div class="form-col">
                                    <label>Ảnh desktop <span class="required">*</span></label>
                                    <div class="input-mode-switch" role="group" aria-label="Desktop image input mode">
                                        <button type="button" class="mode-btn"
                                            :class="{ active: desktopImageInputMode === 'url' }"
                                            @click="setImageInputMode('desktop', 'url')">
                                            Nhập link ảnh
                                        </button>
                                        <button type="button" class="mode-btn"
                                            :class="{ active: desktopImageInputMode === 'upload' }"
                                            @click="setImageInputMode('desktop', 'upload')">
                                            Upload lên Cloudinary
                                        </button>
                                    </div>
                                    <input v-if="desktopImageInputMode === 'url'" v-model.trim="form.desktop_image"
                                        type="url" class="form-control" :class="{ 'is-invalid': !!errors.desktop_image }"
                                        placeholder="https://...">
                                    <div v-else class="upload-inline-actions">
                                        <input ref="desktopFileInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif"
                                            class="hidden-file-input" @change="onDesktopFileChange">
                                        <button class="btn btn-secondary btn-upload-inline" type="button"
                                            :disabled="desktopUploading || saving" @click="triggerDesktopPicker">
                                            <i class="fas" :class="desktopUploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
                                            {{ desktopUploading ? 'Đang upload ảnh desktop...' : 'Upload ảnh desktop' }}
                                        </button>
                                        <span class="upload-inline-hint">PNG/JPG/WEBP/GIF, tối đa 1MB. Ảnh chỉ upload khi bấm Lưu popup.</span>
                                    </div>
                                    <p v-if="errors.desktop_image" class="field-error">{{ errors.desktop_image }}</p>
                                </div>
                                <div class="form-col">
                                    <div class="image-preview-card">
                                        <p class="image-preview-title">Xem trước ảnh desktop</p>
                                        <div class="image-preview-surface">
                                            <img v-if="desktopPreviewSrc" :src="desktopPreviewSrc" alt="Desktop preview" class="image-preview">
                                            <p v-else class="image-preview-empty">Chưa có ảnh desktop để xem trước</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="form-group full">
                            <div class="form-split">
                                <div class="form-col">
                                    <label>Ảnh mobile URL</label>
                                    <div class="input-mode-switch" role="group" aria-label="Mobile image input mode">
                                        <button type="button" class="mode-btn"
                                            :class="{ active: mobileImageInputMode === 'url' }"
                                            @click="setImageInputMode('mobile', 'url')">
                                            Nhập link ảnh
                                        </button>
                                        <button type="button" class="mode-btn"
                                            :class="{ active: mobileImageInputMode === 'upload' }"
                                            @click="setImageInputMode('mobile', 'upload')">
                                            Upload lên Cloudinary
                                        </button>
                                    </div>
                                    <input v-if="mobileImageInputMode === 'url'" v-model.trim="form.mobile_image"
                                        type="url" class="form-control" :class="{ 'is-invalid': !!errors.mobile_image }"
                                        placeholder="https://...">
                                    <div v-else class="upload-inline-actions">
                                        <input ref="mobileFileInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif"
                                            class="hidden-file-input" @change="onMobileFileChange">
                                        <button class="btn btn-secondary btn-upload-inline" type="button"
                                            :disabled="mobileUploading || saving" @click="triggerMobilePicker">
                                            <i class="fas" :class="mobileUploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
                                            {{ mobileUploading ? 'Đang upload ảnh mobile...' : 'Upload ảnh mobile' }}
                                        </button>
                                        <span class="upload-inline-hint">PNG/JPG/WEBP/GIF, tối đa 1MB. Ảnh chỉ upload khi bấm Lưu popup.</span>
                                    </div>
                                    <p v-if="errors.mobile_image" class="field-error">{{ errors.mobile_image }}</p>
                                </div>
                                <div class="form-col">
                                    <div class="image-preview-card">
                                        <p class="image-preview-title">Xem trước ảnh mobile</p>
                                        <div class="image-preview-surface">
                                            <img v-if="mobilePreviewSrc" :src="mobilePreviewSrc" alt="Mobile preview" class="image-preview">
                                            <p v-else class="image-preview-empty">Chưa có ảnh mobile để xem trước</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="form-group full">
                            <label>Link chuyển hướng</label>
                            <input v-model.trim="form.link" type="url" class="form-control" :class="{ 'is-invalid': !!errors.link }" placeholder="https://...">
                            <p v-if="errors.link" class="field-error">{{ errors.link }}</p>
                        </div>

                        <div class="form-group">
                            <label>Trang hiển thị <span class="required">*</span></label>
                            <select v-model="form.page" class="form-control" :class="{ 'is-invalid': !!errors.page }">
                                <option v-for="opt in pageOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                            </select>
                            <p v-if="errors.page" class="field-error">{{ errors.page }}</p>
                        </div>

                        <div class="form-group">
                            <label>Vị trí hiển thị <span class="required">*</span></label>
                            <select v-model="form.position" class="form-control" :class="{ 'is-invalid': !!errors.position }">
                                <option v-for="opt in positionOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                            </select>
                            <p v-if="errors.position" class="field-error">{{ errors.position }}</p>
                        </div>

                        <div class="form-group">
                            <label>Độ ưu tiên</label>
                            <input v-model.number="form.priority" type="number" class="form-control" min="0">
                        </div>

                        <div class="form-group">
                            <label>Kiểu đóng popup <span class="required">*</span></label>
                            <select v-model="form.close_type" class="form-control" :class="{ 'is-invalid': !!errors.close_type }">
                                <option v-for="opt in closeTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                            </select>
                            <p v-if="errors.close_type" class="field-error">{{ errors.close_type }}</p>
                        </div>

                        <div class="form-group">
                            <label>Bắt đầu hiển thị</label>
                            <input v-model="form.start_at" type="datetime-local" class="form-control" :class="{ 'is-invalid': !!errors.start_at }">
                            <p v-if="errors.start_at" class="field-error">{{ errors.start_at }}</p>
                        </div>

                        <div class="form-group">
                            <label>Kết thúc hiển thị</label>
                            <input v-model="form.end_at" type="datetime-local" class="form-control" :class="{ 'is-invalid': !!errors.end_at }">
                            <p v-if="errors.end_at" class="field-error">{{ errors.end_at }}</p>
                        </div>

                        <div class="form-group full">
                            
                            <label class="switch-label">
                                <input  class="switch-button"
                                    v-model="form.is_active"
                                    type="checkbox"
                                >
                                <span>Kích hoạt popup</span>
                            </label>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" :disabled="saving" @click="closeForm">Hủy</button>
                        <button type="submit" class="btn btn-primary" :disabled="saving">
                            <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                            {{ saving ? 'Đang lưu...' : 'Lưu popup' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <Toast />
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { useNotifications } from '~/composables/useNotifications'
import { formatSettingsNotificationMessage } from '~/utils/settingsNotificationFormatter'


definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'permission'],
    ssr: false
})

useHead({
    title: 'Popup quảng cáo - Admin'
})

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError, showInfo } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2]))

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const campaigns = ref([])

const showForm = ref(false)
const editingId = ref(null)
const desktopUploading = ref(false)
const mobileUploading = ref(false)
const desktopFileInput = ref(null)
const mobileFileInput = ref(null)
const desktopPreviewTempUrl = ref('')
const mobilePreviewTempUrl = ref('')
const pendingDesktopFile = ref(null)
const pendingMobileFile = ref(null)
const desktopImageInputMode = ref('upload')
const mobileImageInputMode = ref('upload')

const pageOptions = [
    { value: 'all', label: 'Tất cả trang' },
    { value: 'home', label: 'Trang chủ' },
    { value: 'about', label: 'Giới thiệu' },
    { value: 'schools', label: 'Trường học' },
    { value: 'news', label: 'Tin tức' },
    { value: 'contact', label: 'Liên hệ' },
    { value: 'conditions', label: 'Điều kiện' }
]

const positionOptions = [
    { value: 'center', label: 'Giữa màn hình' },
    { value: 'bottom-right', label: 'Góc phải dưới' },
    { value: 'bottom-left', label: 'Góc trái dưới' },
    { value: 'top-right', label: 'Góc phải trên' },
    { value: 'top-left', label: 'Góc trái trên' },
    { value: 'fullscreen', label: 'Toàn màn hình' }
]

const closeTypeOptions = [
    { value: 'session', label: 'Trong phiên (session)' },
    { value: 'day', label: 'Theo ngày' },
    { value: 'always', label: 'Luôn ẩn sau khi đóng' }
]

const form = reactive({
    title: '',
    desktop_image: '',
    mobile_image: '',
    link: '',
    page: 'all',
    position: 'center',
    priority: 0,
    is_active: true,
    start_at: '',
    end_at: '',
    close_type: 'session'
})

const errors = reactive({
    title: '',
    desktop_image: '',
    mobile_image: '',
    link: '',
    page: '',
    position: '',
    start_at: '',
    end_at: '',
    close_type: ''
})

const desktopPreviewSrc = computed(() => String(desktopPreviewTempUrl.value || form.desktop_image || '').trim())
const mobilePreviewSrc = computed(() => String(mobilePreviewTempUrl.value || form.mobile_image || '').trim())

const isValidUrl = (value) => {
    if (!value) return true
    try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
        return false
    }
}

const resetPreviewObjectUrl = (previewRef) => {
    if (!previewRef.value) return
    URL.revokeObjectURL(previewRef.value)
    previewRef.value = ''
}

const clearPendingDesktopSelection = () => {
    pendingDesktopFile.value = null
    resetPreviewObjectUrl(desktopPreviewTempUrl)
}

const clearPendingMobileSelection = () => {
    pendingMobileFile.value = null
    resetPreviewObjectUrl(mobilePreviewTempUrl)
}

const clearPendingImageSelections = () => {
    clearPendingDesktopSelection()
    clearPendingMobileSelection()
}

const syncImageInputModesFromForm = () => {
    desktopImageInputMode.value = form.desktop_image ? 'url' : 'upload'
    mobileImageInputMode.value = form.mobile_image ? 'url' : 'upload'
}

const setImageInputMode = (type, mode) => {
    if (!['url', 'upload'].includes(mode)) return

    if (type === 'desktop') {
        desktopImageInputMode.value = mode
        if (mode === 'url') clearPendingDesktopSelection()
    }

    if (type === 'mobile') {
        mobileImageInputMode.value = mode
        if (mode === 'url') clearPendingMobileSelection()
    }
}

const triggerDesktopPicker = () => {
    desktopFileInput.value?.click()
}

const triggerMobilePicker = () => {
    mobileFileInput.value?.click()
}

const uploadCampaignImageFile = async (file, imageType = 'desktop') => {
    const fileType = String(file?.type || '').toLowerCase()
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(fileType)) {
        throw new Error('Định dạng file ảnh không hợp lệ (chỉ nhận PNG/JPG/WEBP/GIF)')
    }

    if (file.size > 1 * 1024 * 1024) {
        throw new Error('File ảnh vượt quá 1MB')
    }

    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', imageType)

    const response = await fetch(`${API_BASE}/settings/popup-campaigns/upload-image`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(data?.message || 'Upload ảnh thất bại')
    }

    const uploadedUrl = String(data?.data?.url || '').trim()
    if (!uploadedUrl) {
        throw new Error('Không nhận được URL ảnh từ server')
    }

    return {
        uploadedUrl,
        uploadedPublicId: String(data?.data?.publicId || '').trim()
    }
}

const rollbackUploadedImages = async (publicIds = []) => {
    const validPublicIds = publicIds.filter(Boolean)
    await Promise.all(validPublicIds.map((publicId) => fetch(`${API_BASE}/settings/popup-campaigns/upload-image`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId })
    }).catch(() => null)))
}

const onDesktopFileChange = (event) => {
    const file = event?.target?.files?.[0]
    event.target.value = ''
    if (!file) return

    const fileType = String(file?.type || '').toLowerCase()
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(fileType)) {
        showError('Định dạng file ảnh desktop không hợp lệ (chỉ nhận PNG/JPG/WEBP/GIF)')
        return
    }

    if (file.size > 1 * 1024 * 1024) {
        showError('File ảnh desktop vượt quá 1MB')
        return
    }

    resetPreviewObjectUrl(desktopPreviewTempUrl)
    desktopPreviewTempUrl.value = URL.createObjectURL(file)
    pendingDesktopFile.value = file
    errors.desktop_image = ''
    showInfo('Ảnh desktop đã được chọn. Ảnh sẽ chỉ upload khi bạn bấm Lưu popup.')
}

const onMobileFileChange = (event) => {
    const file = event?.target?.files?.[0]
    event.target.value = ''
    if (!file) return

    const fileType = String(file?.type || '').toLowerCase()
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(fileType)) {
        showError('Định dạng file ảnh mobile không hợp lệ (chỉ nhận PNG/JPG/WEBP/GIF)')
        return
    }

    if (file.size > 1 * 1024 * 1024) {
        showError('File ảnh mobile vượt quá 1MB')
        return
    }

    resetPreviewObjectUrl(mobilePreviewTempUrl)
    mobilePreviewTempUrl.value = URL.createObjectURL(file)
    pendingMobileFile.value = file
    errors.mobile_image = ''
    showInfo('Ảnh mobile đã được chọn. Ảnh sẽ chỉ upload khi bạn bấm Lưu popup.')
}

const clearErrors = () => {
    Object.keys(errors).forEach((key) => {
        errors[key] = ''
    })
}

const toDateTimeLocal = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''

    const pad = (n) => String(n).padStart(2, '0')
    const yyyy = date.getFullYear()
    const mm = pad(date.getMonth() + 1)
    const dd = pad(date.getDate())
    const hh = pad(date.getHours())
    const min = pad(date.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

const formatDateTime = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleString('vi-VN')
}

const pageLabel = (value) => pageOptions.find((item) => item.value === value)?.label || value
const positionLabel = (value) => positionOptions.find((item) => item.value === value)?.label || value
const closeTypeLabel = (value) => closeTypeOptions.find((item) => item.value === value)?.label || value

const resetForm = () => {
    form.title = ''
    form.desktop_image = ''
    form.mobile_image = ''
    form.link = ''
    form.page = 'all'
    form.position = 'center'
    form.priority = 0
    form.is_active = true
    form.start_at = ''
    form.end_at = ''
    form.close_type = 'session'
    editingId.value = null
    clearErrors()
    clearPendingImageSelections()
    syncImageInputModesFromForm()
}

const openCreateForm = () => {
    resetForm()
    showForm.value = true
}

const openEditForm = (item) => {
    resetForm()
    editingId.value = item.id

    form.title = item.title || ''
    form.desktop_image = item.desktop_image || ''
    form.mobile_image = item.mobile_image || ''
    form.link = item.link || ''
    form.page = item.page || 'all'
    form.position = item.position || 'center'
    form.priority = Number(item.priority || 0)
    form.is_active = Boolean(item.is_active)
    form.start_at = toDateTimeLocal(item.start_at)
    form.end_at = toDateTimeLocal(item.end_at)
    form.close_type = item.close_type || 'session'

    clearPendingImageSelections()
    syncImageInputModesFromForm()

    showForm.value = true
}

const closeForm = () => {
    showForm.value = false
    resetForm()
}

const fetchCampaigns = async () => {
    loading.value = true
    error.value = ''
    try {
        const response = await fetch(`${API_BASE}/settings/popup-campaigns`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data?.message || 'Không thể tải danh sách popup')
        }

        campaigns.value = Array.isArray(data?.data) ? data.data : []
    } catch (err) {
        error.value = formatSettingsNotificationMessage(err.message) || 'Không thể tải danh sách popup'
    } finally {
        loading.value = false
    }
}

const saveCampaign = async () => {
    saving.value = true
    clearErrors()
    const uploadedPublicIds = []

    try {
        const payload = {
            title: form.title,
            desktop_image: form.desktop_image,
            mobile_image: form.mobile_image,
            link: form.link,
            page: form.page,
            position: form.position,
            priority: Number(form.priority || 0),
            is_active: Boolean(form.is_active),
            start_at: form.start_at || null,
            end_at: form.end_at || null,
            close_type: form.close_type
        }

        if (desktopImageInputMode.value === 'url') {
            if (!payload.desktop_image) {
                errors.desktop_image = 'Ảnh desktop là bắt buộc'
            } else if (!isValidUrl(payload.desktop_image)) {
                errors.desktop_image = 'Ảnh desktop URL không hợp lệ (cần bắt đầu bằng http/https)'
            }
        } else if (pendingDesktopFile.value) {
            desktopUploading.value = true
            const { uploadedUrl, uploadedPublicId } = await uploadCampaignImageFile(pendingDesktopFile.value, 'desktop')
            payload.desktop_image = uploadedUrl
            if (uploadedPublicId) uploadedPublicIds.push(uploadedPublicId)
        } else if (!payload.desktop_image) {
            errors.desktop_image = 'Bạn phải chọn ảnh desktop để upload hoặc chuyển sang chế độ nhập link'
        }

        if (mobileImageInputMode.value === 'url') {
            if (payload.mobile_image && !isValidUrl(payload.mobile_image)) {
                errors.mobile_image = 'Ảnh mobile URL không hợp lệ (cần bắt đầu bằng http/https)'
            }
        } else if (pendingMobileFile.value) {
            mobileUploading.value = true
            const { uploadedUrl, uploadedPublicId } = await uploadCampaignImageFile(pendingMobileFile.value, 'mobile')
            payload.mobile_image = uploadedUrl
            if (uploadedPublicId) uploadedPublicIds.push(uploadedPublicId)
        }

        if (Object.values(errors).some(Boolean)) {
            showError('Vui lòng kiểm tra lại thông tin popup')
            return
        }

        const method = editingId.value ? 'PUT' : 'POST'
        const url = editingId.value
            ? `${API_BASE}/settings/popup-campaigns/${editingId.value}`
            : `${API_BASE}/settings/popup-campaigns`

        const response = await fetch(url, {
            method,
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        const data = await response.json()
        if (!response.ok) {
            if (data?.errors) {
                Object.keys(errors).forEach((key) => {
                    errors[key] = data.errors[key] || ''
                })
            }
            throw new Error(data?.message || 'Không thể lưu popup')
        }

        showSuccess(formatSettingsNotificationMessage(data?.message) || 'Lưu popup thành công')
        closeForm()
        await fetchCampaigns()
    } catch (err) {
        await rollbackUploadedImages(uploadedPublicIds)
        showError(formatSettingsNotificationMessage(err.message) || 'Không thể lưu popup')
    } finally {
        desktopUploading.value = false
        mobileUploading.value = false
        saving.value = false
    }
}

const deleteCampaign = async (item) => {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa popup "${item.title}"?`)
    if (!confirmed) return

    saving.value = true
    try {
        const response = await fetch(`${API_BASE}/settings/popup-campaigns/${item.id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.message || 'Không thể xóa popup')
        }

        showSuccess(formatSettingsNotificationMessage(data?.message) || 'Đã xóa popup')
        await fetchCampaigns()
    } catch (err) {
        showError(formatSettingsNotificationMessage(err.message) || 'Không thể xóa popup')
    } finally {
        saving.value = false
    }
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await fetchCampaigns()
    }
})

onBeforeUnmount(() => {
    clearPendingImageSelections()
})
</script>

<style scoped>
.switch-label { display: flex !important; align-items: center; gap: 0.6rem; cursor: pointer; }
.switch-button {

    appearance: none;

    width: 52px;
    height: 28px;

    background: #d1d5db;

    border-radius: 999px;

    cursor: pointer;

    position: relative;

    transition: .25s;

}

.switch-button::before {

    content: "";

    position: absolute;

    width: 22px;
    height: 22px;

    top: 3px;
    left: 3px;

    background: white;

    border-radius: 50%;

    box-shadow:
        0 2px 6px rgba(0,0,0,.15);

    transition: .25s;

}

.switch-button:checked {

    background: #22c55e;

}

.switch-button:checked::before {

    transform: translateX(24px);

}

.switch-button:hover {

    filter: brightness(0.97);

}

.switch-button:disabled {

    opacity: .5;

    cursor: not-allowed;

}

.popup-campaigns-page {
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

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    padding: 1.5rem 0;
    border-bottom: 2px solid #eee;
    gap: 1rem;
}

.header-content h1 {
    color: #333;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 2rem;
}

.header-content p {
    color: #666;
    margin: 0;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.table-container {
    overflow-x: auto;
}

.table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
}

.table th,
.table td {
    border-bottom: 1px solid #eee;
    padding: 0.75rem;
    vertical-align: top;
    text-align: left;
}

.campaign-title {
    font-weight: 600;
    margin-bottom: 0.35rem;
}

.campaign-link {
    color: #1976d2;
    word-break: break-all;
    font-size: 0.85rem;
}

.badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
}

.badge-success {
    background: #e8f5e9;
    color: #2e7d32;
}

.badge-danger {
    background: #ffebee;
    color: #c62828;
}

.table-actions {
    display: flex;
    gap: 0.5rem;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 1rem;
}

.modal-card {
    width: min(920px, 100%);
    background: #fff;
    border-radius: 14px;
    max-height: 90vh;
    overflow: auto;
}

.modal-header,
.modal-footer {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #eee;
}

.modal-header {
    position: relative;
}

.modal-footer {
    border-bottom: none;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}

.modal-body {
    padding: 1rem 1.25rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.85rem;
}

.form-group.full {
    grid-column: 1 / -1;
}

.form-group label {
    display: block;
    margin-bottom: 0.35rem;
    font-weight: 600;
    color: #334155;
}

.form-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.85rem;
}

.input-mode-switch {
    display: inline-flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
}

.mode-btn {
    border: 1px solid #cbd5e1;
    background: #fff;
    color: #334155;
    border-radius: 8px;
    padding: 0.45rem 0.7rem;
    cursor: pointer;
    font-size: 0.85rem;
}

.mode-btn.active {
    background: #1976d2;
    border-color: #1976d2;
    color: #fff;
}

.hidden-file-input {
    display: none;
}

.upload-inline-actions {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
}

.upload-inline-hint {
    color: #64748b;
    font-size: 0.8rem;
}

.image-preview-card {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 0.6rem;
    background: #f8fafc;
}

.image-preview-title {
    margin: 0 0 0.45rem 0;
    color: #334155;
    font-size: 0.85rem;
    font-weight: 600;
}

.image-preview-surface {
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
    min-height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    overflow: hidden;
}

.image-preview {
    width: 100%;
    height: 100%;
    max-height: 280px;
    object-fit: contain;
}

.image-preview-empty {
    color: #94a3b8;
    text-align: center;
    padding: 0.8rem;
    font-size: 0.85rem;
}

.form-control {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 0.6rem 0.75rem;
}

.is-invalid {
    border-color: #d32f2f;
}

.field-error {
    margin-top: 0.25rem;
    color: #d32f2f;
    font-size: 0.85rem;
}

.required {
    color: #d32f2f;
}

.btn-close {
    border: none;
    background: transparent;
    position: absolute;
    cursor: pointer;
    right: 24px;
    font-size: 24px;
    top: 20px;
}

.btn-close:hover {
    color: #d21919;
}

.loading-state,
.error-state,
.empty-state {
    text-align: center;
    padding: 2.5rem 1rem;
    color: #475569;
}

.loading-state i,
.error-state i,
.empty-state i {
    font-size: 2rem;
    margin-bottom: 0.75rem;
}

.btn {
    border: none;
    border-radius: 8px;
    padding: 0.6rem 0.95rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-primary {
    background: #1976d2;
    color: #fff;
}

.btn-secondary {
    background: #e2e8f0;
    color: #1e293b;
}

.btn-success {
    background: #2e7d32;
    color: #fff;
}

.btn-danger {
    background: #c62828;
    color: #fff;
}

.btn-sm {
    padding: 0.45rem 0.6rem;
}

@media (max-width: 992px) {
    .form-grid {
        grid-template-columns: 1fr;
    }

    .form-split {
        grid-template-columns: 1fr;
    }
}
</style>
