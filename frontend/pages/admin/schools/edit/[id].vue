<template>
    <div class="school-form-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Không thể truy cập Chỉnh sửa trường học</h3>
                <p>Chỉ Superadmin, Admin và Manager mới có thể chỉnh sửa trường học.</p>
                <NuxtLink to="/admin/schools" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i>
                    Quay lại danh sách
                </NuxtLink>
            </div>
        </div>

        <div v-else class="form-wrapper">
            <div class="page-header">
                <div>
                    <h1><i class="fas fa-edit"></i> Chỉnh sửa trường học</h1>
                    <p>Cập nhật thông tin trường #{{ schoolId }}</p>
                </div>
                <NuxtLink to="/admin/schools" class="btn btn-secondary">
                    <i class="fas fa-arrow-left"></i>
                    Quay lại
                </NuxtLink>
            </div>

            <div v-if="loading" class="loading-box">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải dữ liệu trường học...</p>
            </div>

            <div v-else-if="error" class="error-box">
                <i class="fas fa-exclamation-triangle"></i>
                <p>{{ error }}</p>
                <button class="btn btn-primary" @click="fetchSchoolDetail">Thử lại</button>
            </div>

            <form v-else class="school-form" @submit.prevent="handleUpdateSchool">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Tên trường bằng tiếng Nhật <span class="required">*</span></label>
                        <input v-model.trim="form.name" @input="clearFieldError('name')" @blur="handleNameBlur"
                            :class="['form-control', { 'is-invalid': !!formErrors.name }]" type="text"
                            placeholder="Nhập tên trường học bằng tiếng Nhật">
                        <p v-if="formErrors.name" class="field-error">{{ formErrors.name }}</p>
                    </div>

                    <div class="form-group">
                        <label>Tên trường bằng tiếng Anh <span class="required">*</span></label>
                        <input v-model.trim="form.name_en" @input="clearFieldError('name_en')" @blur="handleNameEnBlur"
                            :class="['form-control', { 'is-invalid': !!formErrors.name_en }]" type="text"
                            placeholder="Nhập tên trường học bằng tiếng Anh">
                        <p v-if="formErrors.name_en" class="field-error">{{ formErrors.name_en }}</p>
                    </div>

                    <div class="form-group">
                        <label>Slug <span class="required">*</span></label>
                        <input v-model.trim="form.slug" @input="clearFieldError('slug')" @blur="validateField('slug')"
                            :class="['form-control', { 'is-invalid': !!formErrors.slug }]" type="text"
                            placeholder="Để trống để tự tạo">
                        <p v-if="formErrors.slug" class="field-error">{{ formErrors.slug }}</p>
                    </div>

                    <div class="form-group">
                        <label>Trạng thái</label>
                        <select v-model="form.status" @change="clearFieldError('status')"
                            :class="['form-control', { 'is-invalid': !!formErrors.status }]">
                            <option value="pending">Chờ duyệt</option>
                            <option value="partner">Đối tác</option>
                            <option value="active">Hoạt động</option>
                            <option value="paused">Tạm dừng</option>
                        </select>
                        <p v-if="formErrors.status" class="field-error">{{ formErrors.status }}</p>
                    </div>

                    <div class="form-group">
                        <label>Khu vực <span class="required">*</span></label>
                        <select v-model="form.region_id" @change="clearFieldError('region_id')"
                            :class="['form-control', { 'is-invalid': !!formErrors.region_id }]">
                            <option :value="null">Chọn khu vực</option>
                            <option v-for="region in regions" :key="region.id" :value="Number(region.id)">{{ region.name }}</option>
                        </select>
                        <p v-if="formErrors.region_id" class="field-error">{{ formErrors.region_id }}</p>
                    </div>

                    <div class="form-group">
                        <label>Loại trường <span class="required">*</span></label>
                        <select v-model="form.type_id" @change="clearFieldError('type_id')"
                            :class="['form-control', { 'is-invalid': !!formErrors.type_id }]">
                            <option :value="null">Chọn loại trường</option>
                            <option v-for="type in schoolTypes" :key="type.id" :value="Number(type.id)">{{ type.name }}</option>
                        </select>
                        <p v-if="formErrors.type_id" class="field-error">{{ formErrors.type_id }}</p>
                    </div>

                    <div class="form-group full">
                        <label>Địa chỉ <span class="required">*</span></label>
                        <input v-model.trim="form.location" @input="clearFieldError('location')"
                            @blur="validateField('location')"
                            :class="['form-control', { 'is-invalid': !!formErrors.location }]" type="text"
                            placeholder="Nhập địa chỉ cụ thể">
                        <p v-if="formErrors.location" class="field-error">{{ formErrors.location }}</p>
                    </div>

                    <div class="form-group">
                        <label>Số điện thoại</label>
                        <input v-model.trim="form.phone" @input="clearFieldError('phone')" @blur="validateField('phone')"
                            :class="['form-control', { 'is-invalid': !!formErrors.phone }]" type="text"
                            placeholder="Nhập số điện thoại">
                        <p v-if="formErrors.phone" class="field-error">{{ formErrors.phone }}</p>
                    </div>

                    <div class="form-group">
                        <label>Số FAX</label>
                        <input v-model.trim="form.fax" @input="clearFieldError('fax')" @blur="validateField('fax')"
                            :class="['form-control', { 'is-invalid': !!formErrors.fax }]" type="text"
                            placeholder="Nhập số FAX">
                        <p v-if="formErrors.fax" class="field-error">{{ formErrors.fax }}</p>
                    </div>

                    <div class="form-group">
                        <label>Email</label>
                        <input v-model.trim="form.email" @input="clearFieldError('email')" @blur="validateField('email')"
                            :class="['form-control', { 'is-invalid': !!formErrors.email }]" type="email"
                            placeholder="Nhập email">
                        <p v-if="formErrors.email" class="field-error">{{ formErrors.email }}</p>
                    </div>

                    <div class="form-group">
                        <label>Website</label>
                        <input v-model.trim="form.website" @input="clearFieldError('website')" @blur="validateField('website')"
                            :class="['form-control', { 'is-invalid': !!formErrors.website }]" type="text"
                            placeholder="Nhập website">
                        <p v-if="formErrors.website" class="field-error">{{ formErrors.website }}</p>
                    </div>

                    <div class="form-group full">
                        <hr>
                    </div>

                    <div class="form-group">
                        <label>Kỳ nhập học <span class="required">*</span></label>
                        <div class="checkbox-group">
                            <label v-for="month in INTAKE_MONTH_OPTIONS" :key="month" class="checkbox">
                                <input v-model="form.intake_months" type="checkbox" :value="month" @change="clearFieldError('intake_months')">
                                <span class="checkbox-mark"></span>
                                <span class="checkbox-label">Tháng {{ month }}</span>
                            </label>
                        </div>
                        <p v-if="formErrors.intake_months" class="field-error">{{ formErrors.intake_months }}</p>
                    </div>

                    <div class="form-group">
                        <label>Học phí/năm (Yên Nhật) <span class="required">*</span></label>
                        <input v-model.number="form.tuition_per_year" @input="clearFieldError('tuition_per_year')"
                            @blur="validateField('tuition_per_year')"
                            :class="['form-control', { 'is-invalid': !!formErrors.tuition_per_year }]" type="number"
                            min="0" step="10000">
                        <p v-if="formErrors.tuition_per_year" class="field-error">{{ formErrors.tuition_per_year }}</p>
                    </div>

                    <div class="form-group">
                        <label>Sĩ số lớp</label>
                        <input v-model.number="form.class_size" @input="clearFieldError('class_size')"
                            @blur="validateField('class_size')"
                            :class="['form-control', { 'is-invalid': !!formErrors.class_size }]" type="number"
                            min="1" max="200">
                        <p v-if="formErrors.class_size" class="field-error">{{ formErrors.class_size }}</p>
                    </div>

                    <div class="form-group">
                        <label>Tỉ lệ visa thành công (%) <span class="required">*</span></label>
                        <input v-model.number="form.visa_success_rate" @input="clearFieldError('visa_success_rate')"
                            @blur="validateField('visa_success_rate')"
                            :class="['form-control', { 'is-invalid': !!formErrors.visa_success_rate }]" type="number"
                            min="0" max="100" step="0.1">
                        <p v-if="formErrors.visa_success_rate" class="field-error">{{ formErrors.visa_success_rate }}</p>
                    </div>

                    <div class="form-group">
                        <label>Rating</label>
                        <input v-model.number="form.rating" @input="clearFieldError('rating')" @blur="validateField('rating')"
                            :class="['form-control', { 'is-invalid': !!formErrors.rating }]" type="number"
                            min="0" max="5" step="0.1">
                        <p v-if="formErrors.rating" class="field-error">{{ formErrors.rating }}</p>
                    </div>

                    <div class="form-group">
                        <label>Số lượng review</label>
                        <input v-model.number="form.review_count" @input="clearFieldError('review_count')" @blur="validateField('review_count')"
                            :class="['form-control', { 'is-invalid': !!formErrors.review_count }]" type="number"
                            min="0" step="1">
                        <p v-if="formErrors.review_count" class="field-error">{{ formErrors.review_count }}</p>
                    </div>

                    <div class="form-group full">
                        <div class="form-split">
                            <div class="form-col">
                                <label>Logo trường</label>
                                <div class="input-mode-switch" role="group" aria-label="Logo input mode">
                                    <button type="button" class="mode-btn" :class="{ active: logoInputMode === 'url' }" @click="setImageInputMode('logo', 'url')">
                                        Nhập link ảnh
                                    </button>
                                    <button type="button" class="mode-btn" :class="{ active: logoInputMode === 'upload' }" @click="setImageInputMode('logo', 'upload')">
                                        Upload lên Cloudinary
                                    </button>
                                </div>
                                <input v-if="logoInputMode === 'url'" v-model.trim="form.logo_url"
                                    @input="clearFieldError('logo_url')" type="url" class="form-control"
                                    :class="{ 'is-invalid': !!formErrors.logo_url }"
                                    placeholder="https://example.com/logo.png">
                                <div v-else class="upload-inline-actions">
                                    <input ref="logoFileInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif"
                                        class="hidden-file-input" @change="onLogoFileChange">
                                    <button class="btn btn-secondary btn-upload-inline" type="button"
                                        :disabled="logoUploading || saving || loading" @click="triggerLogoPicker">
                                        <i class="fas" :class="logoUploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
                                        {{ logoUploading ? 'Đang upload logo...' : 'Upload logo' }}
                                    </button>
                                    <span class="upload-inline-hint">PNG/JPG/WEBP/GIF, tối đa 1MB. Ảnh chỉ upload khi bấm Cập nhật trường học.</span>
                                    <p v-if="formErrors.logo_url" class="field-error">{{ formErrors.logo_url }}</p>
                                </div>
                            </div>
                            <div class="form-col">
                                <div class="image-preview-card">
                                    <p class="image-preview-title">Xem trước Logo</p>
                                    <div class="image-preview-surface logo-preview-surface">
                                        <img v-if="logoPreviewSrc" :src="logoPreviewSrc" alt="Logo preview" class="image-preview image-preview-logo">
                                        <p v-else class="image-preview-empty">Chưa có ảnh logo để xem trước</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-group full">
                        <div class="form-split">
                            <div class="form-col">
                                <label>Thumbnail trường</label>
                                <div class="input-mode-switch" role="group" aria-label="Thumbnail input mode">
                                    <button type="button" class="mode-btn" :class="{ active: thumbnailInputMode === 'url' }" @click="setImageInputMode('thumbnail', 'url')">
                                        Nhap link anh
                                    </button>
                                    <button type="button" class="mode-btn" :class="{ active: thumbnailInputMode === 'upload' }" @click="setImageInputMode('thumbnail', 'upload')">
                                        Upload len Cloudinary
                                    </button>
                                </div>
                                <input v-if="thumbnailInputMode === 'url'" v-model.trim="form.thumbnail_url"
                                    @input="clearFieldError('thumbnail_url')" type="url" class="form-control"
                                    :class="{ 'is-invalid': !!formErrors.thumbnail_url }"
                                    placeholder="https://example.com/thumbnail.png">
                                <div v-else class="upload-inline-actions">
                                    <input ref="thumbnailFileInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif"
                                        class="hidden-file-input" @change="onThumbnailFileChange">
                                    <button class="btn btn-secondary btn-upload-inline" type="button"
                                        :disabled="thumbnailUploading || saving || loading" @click="triggerThumbnailPicker">
                                        <i class="fas" :class="thumbnailUploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
                                        {{ thumbnailUploading ? 'Dang upload thumbnail...' : 'Upload thumbnail' }}
                                    </button>
                                    <span class="upload-inline-hint">PNG/JPG/WEBP/GIF, toi da 1MB. Anh chi upload khi bam Cap nhat truong hoc.</span>
                                    <p v-if="formErrors.thumbnail_url" class="field-error">{{ formErrors.thumbnail_url }}</p>
                                </div>
                            </div>
                            <div class="form-col">
                                <div class="image-preview-card">
                                    <p class="image-preview-title">Xem trước Thumbnail</p>
                                    <div class="image-preview-surface thumbnail-preview-surface">
                                        <img v-if="thumbnailPreviewSrc" :src="thumbnailPreviewSrc" alt="Thumbnail preview" class="image-preview image-preview-thumbnail">
                                        <p v-else class="image-preview-empty">Chưa có ảnh thumbnail để xem trước</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-group full">
                        <hr>
                    </div>

                    <div class="form-group full">
                        <div class="features-header">
                            <label>Features / Tag điểm mạnh</label>
                            <button type="button" class="btn btn-outline-secondary btn-sm" @click="addFeature">
                                <i class="fas fa-plus"></i>
                                Thêm feature
                            </button>
                        </div>
                        <p class="field-hint">Mỗi feature là một tag ngắn mô tả điểm mạnh của trường.</p>

                        <div v-if="featureItems.length" class="feature-list form-split">
                            <div v-for="(feature, index) in featureItems" :key="index" class="feature-item form-col">
                                <input v-model.trim="featureItems[index]" @input="clearFieldError('features')"
                                    @blur="normalizeFeature(index)"
                                    :class="['form-control', 'feature-input', { 'is-invalid': !!formErrors.features }]"
                                    type="text" placeholder="Nhập feature tag">
                                <button type="button" class="btn-icon-danger" @click="removeFeature(index)" aria-label="Xóa feature">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>

                        <div v-else class="feature-empty-state">
                            <i class="fas fa-info-circle" style="margin-right: 5px"></i>
                            <span>Chưa có feature nào. Nhấn "Thêm feature" để thêm mới.</span>
                        </div>

                        <p v-if="formErrors.features" class="field-error">{{ formErrors.features }}</p>
                    </div>
                </div>

                <div class="form-actions">
                    <NuxtLink to="/admin/schools" class="btn btn-secondary">Hủy</NuxtLink>
                    <button class="btn btn-primary" type="submit" :disabled="saving">
                        <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                        {{ saving ? 'Đang cập nhật...' : 'Cập nhật trường học' }}
                    </button>
                </div>
            </form>
        </div>

        <Toast />
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { useNotifications } from '~/composables/useNotifications'

definePageMeta({ layout: 'admin', middleware: ['auth', 'permission'], ssr: false })
useHead({ title: 'Chinh sua truong hoc - Admin' })

const route = useRoute()
const schoolId = route.params.id
const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError, showInfo } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2, 3]))

const regions = ref([])
const schoolTypes = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const INTAKE_MONTH_OPTIONS = [1, 4, 7, 10]
const logoInputMode = ref('upload')
const thumbnailInputMode = ref('upload')
const logoUploading = ref(false)
const thumbnailUploading = ref(false)
const logoFileInput = ref(null)
const thumbnailFileInput = ref(null)
const pendingLogoFile = ref(null)
const pendingThumbnailFile = ref(null)
const logoPreviewTempUrl = ref('')
const thumbnailPreviewTempUrl = ref('')

const form = reactive({
    name: '',
    name_en: '',
    slug: '',
    location: '',
    phone: '',
    fax: '',
    email: '',
    website: '',
    tuition_per_year: null,
    class_size: null,
    visa_success_rate: null,
    intake_months: [],
    region_id: null,
    type_id: null,
    status: 'pending',
    logo_url: '',
    thumbnail_url: '',
    rating: null,
    review_count: null
})

const featureItems = ref([])

const formErrors = reactive({
    name: '',
    name_en: '',
    slug: '',
    location: '',
    phone: '',
    fax: '',
    email: '',
    website: '',
    tuition_per_year: '',
    class_size: '',
    visa_success_rate: '',
    intake_months: '',
    region_id: '',
    type_id: '',
    status: '',
    logo_url: '',
    thumbnail_url: '',
    rating: '',
    review_count: '',
    features: ''
})

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const logoPreviewSrc = computed(() => String(logoPreviewTempUrl.value || form.logo_url || '').trim())
const thumbnailPreviewSrc = computed(() => String(thumbnailPreviewTempUrl.value || form.thumbnail_url || '').trim())

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

const isValidEmail = (value) => {
    if (!value) return true
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const isValidPhone = (value) => {
    if (!value) return true
    return /^[0-9+()\-\s]{8,20}$/.test(value)
}

const normalizeFeatureItems = (source) => {
    const rawItems = Array.isArray(source)
        ? source
        : source && typeof source === 'object'
            ? Object.entries(source).every(([key]) => /^\d+$/.test(key))
                ? Object.values(source)
                : Object.keys(source)
            : typeof source === 'string'
                ? source.split(/[,\n;]/)
                : []

    const normalized = []
    const seen = new Set()

    for (const item of rawItems) {
        const value = String(item || '').trim()
        if (!value) continue

        const key = value.toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)
        normalized.push(value)
    }

    return normalized
}

const normalizeIntakeMonths = (source) => {
    if (!Array.isArray(source)) return []

    const allowed = new Set(INTAKE_MONTH_OPTIONS)
    const deduped = []
    const seen = new Set()

    for (const item of source) {
        const month = Number(item)
        if (!Number.isInteger(month) || !allowed.has(month) || seen.has(month)) continue
        seen.add(month)
        deduped.push(month)
    }

    deduped.sort((a, b) => a - b)
    return deduped
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

const clearPendingThumbnailSelection = () => {
    pendingThumbnailFile.value = null
    resetPreviewObjectUrl(thumbnailPreviewTempUrl)
}

const setImageInputMode = (type, mode) => {
    if (!['url', 'upload'].includes(mode)) return

    if (type === 'logo') {
        logoInputMode.value = mode
        clearFieldError('logo_url')
        if (mode === 'url') clearPendingLogoSelection()
    }

    if (type === 'thumbnail') {
        thumbnailInputMode.value = mode
        clearFieldError('thumbnail_url')
        if (mode === 'url') clearPendingThumbnailSelection()
    }
}

const syncImageInputModesFromForm = () => {
    logoInputMode.value = form.logo_url ? 'url' : 'upload'
    thumbnailInputMode.value = form.thumbnail_url ? 'url' : 'upload'
}

const triggerLogoPicker = () => {
    logoFileInput.value?.click()
}

const triggerThumbnailPicker = () => {
    thumbnailFileInput.value?.click()
}

const onLogoFileChange = (event) => {
    const file = event?.target?.files?.[0]
    event.target.value = ''

    if (!file) return

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    const fileType = String(file.type || '').toLowerCase()

    if (!allowedTypes.includes(fileType)) {
        showError('Dinh dang file logo khong hop le (chi nhan PNG/JPG/WEBP/GIF)')
        return
    }

    if (file.size > 1 * 1024 * 1024) {
        showError('File logo vuot qua 1MB')
        return
    }

    resetPreviewObjectUrl(logoPreviewTempUrl)
    logoPreviewTempUrl.value = URL.createObjectURL(file)
    pendingLogoFile.value = file
    clearFieldError('logo_url')
    showInfo('Logo da duoc chon. Anh se chi upload khi ban bam Cap nhat truong hoc.')
}

const onThumbnailFileChange = (event) => {
    const file = event?.target?.files?.[0]
    event.target.value = ''

    if (!file) return

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    const fileType = String(file.type || '').toLowerCase()

    if (!allowedTypes.includes(fileType)) {
        showError('Dinh dang file thumbnail khong hop le (chi nhan PNG/JPG/WEBP/GIF)')
        return
    }

    if (file.size > 1 * 1024 * 1024) {
        showError('File thumbnail vuot qua 1MB')
        return
    }

    resetPreviewObjectUrl(thumbnailPreviewTempUrl)
    thumbnailPreviewTempUrl.value = URL.createObjectURL(file)
    pendingThumbnailFile.value = file
    clearFieldError('thumbnail_url')
    showInfo('Thumbnail da duoc chon. Anh se chi upload khi ban bam Cap nhat truong hoc.')
}

const uploadSchoolImageFile = async ({ file, imageType }) => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', imageType)

    const response = await fetch(`${API_BASE}/schools/upload-image`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(data?.message || `Upload ${imageType} that bai`)
    }

    const uploadedUrl = String(data?.data?.url || '').trim()
    if (!uploadedUrl) {
        throw new Error(`Khong nhan duoc URL ${imageType} tu server`)
    }

    return {
        uploadedUrl,
        uploadedPublicId: String(data?.data?.publicId || '').trim()
    }
}

const rollbackUploadedSchoolImages = async (publicIds = []) => {
    const validPublicIds = publicIds.filter(Boolean)
    await Promise.all(validPublicIds.map((publicId) => fetch(`${API_BASE}/schools/upload-image`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId })
    }).catch(() => null)))
}

const addFeature = () => {
    featureItems.value.push('')
}

const removeFeature = (index) => {
    featureItems.value.splice(index, 1)
}

const normalizeFeature = (index) => {
    if (index < 0 || index >= featureItems.value.length) return
    featureItems.value[index] = String(featureItems.value[index] || '').trim()
}

const handleNameBlur = () => {
    validateField('name')
    if (!form.slug.trim()) {
        form.slug = toSlug(form.name)
    }
    validateField('slug')
}

const handleNameEnBlur = () => {
    validateField('name_en')
}

const validateField = (field) => {
    const name = form.name.trim()
    const nameEn = form.name_en.trim()
    const slug = form.slug.trim()
    const location = form.location.trim()
    const phone = form.phone.trim()
    const fax = form.fax.trim()
    const email = form.email.trim()
    const website = form.website.trim()
    const logo = form.logo_url.trim()
    const thumbnail = form.thumbnail_url.trim()

    if (field === 'name') {
        if (!name) return (formErrors.name = 'Ten truong la bat buoc', false)
        if (name.length < 3) return (formErrors.name = 'Ten truong phai co it nhat 3 ky tu', false)
        if (name.length > 200) return (formErrors.name = 'Ten truong khong duoc vuot qua 200 ky tu', false)
        formErrors.name = ''
        return true
    }

    if (field === 'slug') {
        if (!slug) {
            formErrors.slug = ''
            return true
        }
        if (slug.length < 2) return (formErrors.slug = 'Slug phai co it nhat 2 ky tu', false)
        if (slug.length > 200) return (formErrors.slug = 'Slug khong duoc vuot qua 200 ky tu', false)
        if (!slugPattern.test(slug)) return (formErrors.slug = 'Slug chi gom chu thuong, so va dau gach ngang', false)
        formErrors.slug = ''
        return true
    }

    if (field === 'name_en') {
        if (!nameEn) return (formErrors.name_en = 'Ten truong tieng Anh la bat buoc', false)
        if (nameEn.length < 3) return (formErrors.name_en = 'Ten truong tieng Anh phai co it nhat 3 ky tu', false)
        if (nameEn.length > 200) return (formErrors.name_en = 'Ten truong tieng Anh khong duoc vuot qua 200 ky tu', false)
        formErrors.name_en = ''
        return true
    }

    if (field === 'location') {
        if (!location) return (formErrors.location = 'Dia chi la bat buoc', false)
        if (location.length > 500) return (formErrors.location = 'Dia diem khong duoc vuot qua 500 ky tu', false)
        formErrors.location = ''
        return true
    }

    if (field === 'phone') {
        if (!phone) return (formErrors.phone = '', true)
        if (!isValidPhone(phone)) return (formErrors.phone = 'So dien thoai khong hop le', false)
        formErrors.phone = ''
        return true
    }

    if (field === 'fax') {
        if (!fax) return (formErrors.fax = '', true)
        if (!isValidPhone(fax)) return (formErrors.fax = 'So FAX khong hop le', false)
        formErrors.fax = ''
        return true
    }

    if (field === 'email') {
        if (!email) return (formErrors.email = '', true)
        if (!isValidEmail(email)) return (formErrors.email = 'Email khong hop le', false)
        formErrors.email = ''
        return true
    }

    if (field === 'website') {
        if (!website) return (formErrors.website = '', true)
        if (!isValidHttpUrl(website)) return (formErrors.website = 'Website khong hop le (http/https)', false)
        formErrors.website = ''
        return true
    }

    if (field === 'tuition_per_year') {
        if (form.tuition_per_year === null || form.tuition_per_year === undefined || form.tuition_per_year === '') return (formErrors.tuition_per_year = 'Hoc phi la bat buoc', false)
        const value = Number(form.tuition_per_year)
        if (!Number.isFinite(value) || value < 0 || value > 10000000) return (formErrors.tuition_per_year = 'Hoc phi phai trong khoang 0 - 10000000', false)
        formErrors.tuition_per_year = ''
        return true
    }

    if (field === 'class_size') {
        if (form.class_size === null || form.class_size === undefined || form.class_size === '') {
            formErrors.class_size = ''
            return true
        }
        const value = Number(form.class_size)
        if (!Number.isInteger(value) || value < 1 || value > 200) return (formErrors.class_size = 'Si so lop phai trong khoang 1 - 200', false)
        formErrors.class_size = ''
        return true
    }

    if (field === 'visa_success_rate') {
        if (form.visa_success_rate === null || form.visa_success_rate === undefined || form.visa_success_rate === '') return (formErrors.visa_success_rate = 'Ti le visa la bat buoc', false)
        const value = Number(form.visa_success_rate)
        if (!Number.isFinite(value) || value < 0 || value > 100) return (formErrors.visa_success_rate = 'Ti le visa phai trong khoang 0 - 100', false)
        formErrors.visa_success_rate = ''
        return true
    }

    if (field === 'intake_months') {
        form.intake_months = normalizeIntakeMonths(form.intake_months)
        if (!form.intake_months.length) return (formErrors.intake_months = 'Vui long chon it nhat 1 ky nhap hoc', false)
        formErrors.intake_months = ''
        return true
    }

    if (field === 'region_id') {
        if (form.region_id === null || form.region_id === undefined || form.region_id === '') return (formErrors.region_id = 'Khu vuc la bat buoc', false)
        if (!Number.isInteger(Number(form.region_id)) || Number(form.region_id) < 1) return (formErrors.region_id = 'Khu vuc khong hop le', false)
        formErrors.region_id = ''
        return true
    }

    if (field === 'type_id') {
        if (form.type_id === null || form.type_id === undefined || form.type_id === '') return (formErrors.type_id = 'Loai truong la bat buoc', false)
        if (!Number.isInteger(Number(form.type_id)) || Number(form.type_id) < 1) return (formErrors.type_id = 'Loai truong khong hop le', false)
        formErrors.type_id = ''
        return true
    }

    if (field === 'status') {
        if (!['partner', 'active', 'paused', 'pending'].includes(form.status)) return (formErrors.status = 'Trang thai khong hop le', false)
        formErrors.status = ''
        return true
    }

    if (field === 'logo_url') {
        if (!logo) {
            formErrors.logo_url = ''
            return true
        }
        if (!isValidHttpUrl(logo)) return (formErrors.logo_url = 'Logo URL khong hop le (http/https)', false)
        formErrors.logo_url = ''
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

    if (field === 'rating') {
        if (form.rating === null || form.rating === undefined || form.rating === '') {
            formErrors.rating = ''
            return true
        }
        const value = Number(form.rating)
        if (!Number.isFinite(value) || value < 0 || value > 5) return (formErrors.rating = 'Rating phai trong khoang 0 - 5', false)
        formErrors.rating = ''
        return true
    }

    if (field === 'review_count') {
        if (form.review_count === null || form.review_count === undefined || form.review_count === '') {
            formErrors.review_count = ''
            return true
        }
        const value = Number(form.review_count)
        if (!Number.isInteger(value) || value < 0) return (formErrors.review_count = 'So luong review phai la so nguyen >= 0', false)
        formErrors.review_count = ''
        return true
    }

    if (field === 'features') {
        featureItems.value = normalizeFeatureItems(featureItems.value)
        formErrors.features = ''
        return true
    }

    return true
}

const validateForm = () => {
    const fields = ['name', 'name_en', 'slug', 'location', 'phone', 'fax', 'email', 'website', 'tuition_per_year', 'class_size', 'visa_success_rate', 'intake_months', 'region_id', 'type_id', 'status', 'logo_url', 'thumbnail_url', 'rating', 'review_count', 'features']
    return fields.every((field) => validateField(field))
}

const fetchRegions = async () => {
    try {
        const response = await fetch(`${API_BASE}/regions`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (response.ok) regions.value = data.data || []
    } catch {
        regions.value = []
    }
}

const fetchSchoolTypes = async () => {
    try {
        const response = await fetch(`${API_BASE}/school-types`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (response.ok) schoolTypes.value = data.data || []
    } catch {
        schoolTypes.value = []
    }
}

const fetchSchoolDetail = async () => {
    loading.value = true
    error.value = ''
    try {
        const response = await fetch(`${API_BASE}/schools/${schoolId}`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`)

        const item = data.data || {}
        form.name = item.name || ''
        form.name_en = item.name_en || ''
        form.slug = item.slug || ''
        form.location = item.location || ''
        form.phone = item.phone || ''
        form.fax = item.fax || ''
        form.email = item.email || ''
        form.website = item.website || ''
        form.tuition_per_year = item.tuition_per_year !== null && item.tuition_per_year !== undefined ? Number(item.tuition_per_year) : null
        form.class_size = item.class_size !== null && item.class_size !== undefined ? Number(item.class_size) : null
        form.visa_success_rate = item.visa_success_rate !== null && item.visa_success_rate !== undefined ? Number(item.visa_success_rate) : null
        form.intake_months = normalizeIntakeMonths(item.intake_months)
        form.region_id = item.region_id ? Number(item.region_id) : null
        form.type_id = item.type_id ? Number(item.type_id) : null
        form.status = item.status || 'pending'
        form.logo_url = item.logo_url || ''
        form.thumbnail_url = item.thumbnail_url || ''
        form.rating = item.rating !== null && item.rating !== undefined ? Number(item.rating) : null
        form.review_count = item.review_count !== null && item.review_count !== undefined ? Number(item.review_count) : null
        featureItems.value = normalizeFeatureItems(item.features)

        clearPendingLogoSelection()
        clearPendingThumbnailSelection()
        syncImageInputModesFromForm()
    } catch (err) {
        error.value = err.message || 'Khong the tai truong hoc'
    } finally {
        loading.value = false
    }
}

const buildPayload = () => {
    const payload = {
        name: form.name,
        name_en: form.name_en,
        slug: form.slug || undefined,
        location: form.location || undefined,
        phone: form.phone || undefined,
        fax: form.fax || undefined,
        email: form.email || undefined,
        website: form.website || undefined,
        tuition_per_year: form.tuition_per_year || undefined,
        class_size: form.class_size || undefined,
        visa_success_rate: form.visa_success_rate || undefined,
        intake_months: normalizeIntakeMonths(form.intake_months),
        region_id: form.region_id || undefined,
        type_id: form.type_id || undefined,
        status: form.status,
        logo_url: form.logo_url || undefined,
        thumbnail_url: form.thumbnail_url || undefined,
        rating: form.rating === null || form.rating === undefined || form.rating === '' ? undefined : Number(form.rating),
        review_count: form.review_count === null || form.review_count === undefined || form.review_count === '' ? undefined : Number(form.review_count)
    }

    const features = normalizeFeatureItems(featureItems.value)
    if (features.length) {
        payload.features = features.reduce((accumulator, feature) => {
            accumulator[feature] = true
            return accumulator
        }, {})
    }

    return payload
}

const handleUpdateSchool = async () => {
    setBackendFieldErrors({})
    if (!validateForm()) {
        showError('Vui long kiem tra lai thong tin truong hoc')
        return
    }

    saving.value = true
    const uploadedPublicIds = []
    let uploadedLogoPublicId = ''
    let uploadedThumbnailPublicId = ''

    try {
        const payload = buildPayload()

        if (pendingLogoFile.value) {
            logoUploading.value = true
            const { uploadedUrl, uploadedPublicId } = await uploadSchoolImageFile({ file: pendingLogoFile.value, imageType: 'logo' })
            payload.logo_url = uploadedUrl
            if (uploadedPublicId) uploadedPublicIds.push(uploadedPublicId)
            uploadedLogoPublicId = uploadedPublicId || ''
        }

        if (pendingThumbnailFile.value) {
            thumbnailUploading.value = true
            const { uploadedUrl, uploadedPublicId } = await uploadSchoolImageFile({ file: pendingThumbnailFile.value, imageType: 'thumbnail' })
            payload.thumbnail_url = uploadedUrl
            if (uploadedPublicId) uploadedPublicIds.push(uploadedPublicId)
            uploadedThumbnailPublicId = uploadedPublicId || ''
        }

        if (uploadedLogoPublicId) {
            payload.logoAssetPublicId = uploadedLogoPublicId
        }

        if (uploadedThumbnailPublicId) {
            payload.thumbnailAssetPublicId = uploadedThumbnailPublicId
        }

        const response = await fetch(`${API_BASE}/schools/${schoolId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        const data = await response.json()
        if (!response.ok) {
            if (data?.errors) setBackendFieldErrors(data.errors)
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        clearPendingLogoSelection()
        clearPendingThumbnailSelection()
        showSuccess(data?.message || 'Cap nhat truong hoc thanh cong')
        await navigateTo('/admin/schools')
    } catch (err) {
        await rollbackUploadedSchoolImages(uploadedPublicIds)
        showError(err.message || 'Khong the cap nhat truong hoc')
    } finally {
        logoUploading.value = false
        thumbnailUploading.value = false
        saving.value = false
    }
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await Promise.all([fetchRegions(), fetchSchoolTypes(), fetchSchoolDetail()])
    }
})

onBeforeUnmount(() => {
    clearPendingLogoSelection()
    clearPendingThumbnailSelection()
})
</script>

<style scoped>
.school-form-page {
    padding: 0;
    min-height: 100vh;
}

.form-wrapper {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #eee;
}

.page-header h1 {
    margin: 0 0 0.5rem 0;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
}

.page-header p {
    margin: 0;
    color: #666;
}

.school-form {
    margin-top: 1rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.form-col {
    min-width: 0;
}

.form-group.full {
    grid-column: 1 / -1;
}

.form-group hr {
    border-bottom: 3px solid #777;
    margin: 10px 0;
}

.form-group > label,
.features-header > label,
.form-col > label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
    font-weight: 500;
}

.form-control {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;
}

.checkbox-group {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
}

.checkbox {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    user-select: none;
}

.checkbox input {
    display: none;
}

.checkbox-mark {
    position: relative;
    width: 20px;
    height: 20px;
    border: 2px solid #d0d5dd;
    border-radius: 6px;
    background: #fff;
    transition: all .2s ease;
}

.checkbox:hover .checkbox-mark {
    border-color: #3b82f6;
}

.checkbox input:checked + .checkbox-mark {
    background: #3b82f6;
    border-color: #3b82f6;
}

.checkbox input:checked + .checkbox-mark::after {
    content: "";
    position: absolute;
    left: 5px;
    top: 1px;
    width: 5px;
    height: 10px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.checkbox-label {
    font-size: 14px;
    color: #344054;
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

.thumbnail-preview-surface {
    min-height: 140px;
}

.image-preview {
    max-width: 100%;
    max-height: 120px;
    object-fit: contain;
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

.loading-box,
.error-box {
    text-align: center;
    padding: 2rem;
    color: #666;
}

.loading-box i {
    font-size: 2rem;
    color: #2196f3;
    margin-bottom: 1rem;
}

.error-box i {
    font-size: 2rem;
    color: #f44336;
    margin-bottom: 1rem;
}

.form-control:focus {
    outline: none;
    border-color: #1976d2;
}

.form-control.is-invalid {
    border-color: #dc3545;
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.15);
}

textarea.form-control {
    resize: vertical;
}

.required {
    color: #dc3545;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
}

.btn {
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
}

.btn-primary {
    background: #1976d2;
    color: white;
}

.btn-secondary {
    background: #f5f5f5;
    color: #666;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.features-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.field-hint {
    margin: 0 0 0.75rem;
    color: #6b7280;
    font-size: 0.875rem;
}

.feature-list {
    display: grid;
    gap: 0.75rem;
}

.feature-item {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
    align-items: center;
}

.feature-input {
    min-width: 0;
}

.feature-empty-state {
    padding: 0.85rem 1rem;
    border: 1px dashed #cbd5e1;
    border-radius: 10px;
    background: #f8fafc;
    color: #64748b;
    font-size: 0.92rem;
}

.btn-icon-danger {
    width: 40px;
    height: 40px;
    border: 1px solid #f1b4b8;
    background: #fff5f5;
    color: #dc3545;
    border-radius: 10px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.btn-icon-danger:hover {
    background: #ffe3e6;
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

@media (max-width: 768px) {
    .form-grid {
        grid-template-columns: 1fr;
    }

    .form-wrapper {
        padding: 1rem;
    }

    .page-header {
        flex-direction: column;
        gap: 1rem;
    }

    .header-actions {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
    }

    .features-header {
        align-items: flex-start;
        flex-direction: column;
    }
}
</style>
