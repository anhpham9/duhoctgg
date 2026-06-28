<template>
    <div class="team-member-form-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Không thể truy cập Quản lý Đội ngũ</h3>
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
                        <i class="fas" :class="memberId ? 'fa-edit' : 'fa-plus'"></i>
                        {{ memberId ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới' }}
                    </h1>
                </div>
                <div class="header-actions">
                    <NuxtLink to="/admin/team-members" class="btn btn-secondary">
                        <i class="fas fa-arrow-left"></i>
                        Quay lại
                    </NuxtLink>
                </div>
            </div>

            <div v-if="loading" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải dữ liệu...</p>
            </div>

            <div v-else class="form-wrapper">
                <form @submit.prevent="saveMember" class="form-section">
                    <!-- Basic Info -->
                    <div class="section">
                        <div class="section-header">
                            <h3><i class="fas fa-user"></i> Thông tin cơ bản</h3>
                        </div>

                        <div class="form-grid two-columns">
                            <div class="form-group">
                                <label>Tên <span class="required">*</span></label>
                                <input
                                    v-model.trim="formData.name"
                                    @input="clearError('name')"
                                    type="text"
                                    class="form-control"
                                    :class="{ 'is-invalid': !!formErrors.name }"
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    maxlength="255"
                                >
                                <p v-if="formErrors.name" class="field-error">{{ formErrors.name }}</p>
                                <small class="field-hint">{{ formData.name.length }}/255 ký tự</small>
                            </div>

                            <div class="form-group">
                                <label>Vị trí <span class="required">*</span></label>
                                <input
                                    v-model.trim="formData.position"
                                    @input="clearError('position')"
                                    type="text"
                                    class="form-control"
                                    :class="{ 'is-invalid': !!formErrors.position }"
                                    placeholder="Ví dụ: CEO & Founder"
                                    maxlength="255"
                                >
                                <p v-if="formErrors.position" class="field-error">{{ formErrors.position }}</p>
                                <small class="field-hint">{{ formData.position.length }}/255 ký tự</small>
                            </div>

                            <div class="form-group full">
                                <label>Giới thiệu</label>
                                <textarea
                                    v-model.trim="formData.description"
                                    class="form-control"
                                    rows="3"
                                    placeholder="Ví dụ: 10+ năm kinh nghiệm trong lĩnh vực tư vấn du học..."
                                ></textarea>
                                <small class="field-hint">{{ formData.description.length }} ký tự</small>
                            </div>

                            <div class="form-group">
                                <label>Thứ tự sắp xếp</label>
                                <input
                                    v-model.number="formData.sortOrder"
                                    type="number"
                                    class="form-control"
                                    placeholder="0"
                                >
                                <small class="field-hint">Vị trí hiển thị (0 là đầu tiên)</small>
                            </div>

                            <div class="form-group">
                                <label>Trạng thái</label>
                                <select v-model="formData.isActive" class="form-control">
                                    <option :value="true">Kích hoạt</option>
                                    <option :value="false">Ẩn</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Photo Upload -->
                    <div class="section">
                        <div class="section-header">
                            <h3><i class="fas fa-image"></i> Ảnh đại diện</h3>
                        </div>

                        <div class="form-grid full-width">
                            <div class="form-col">
                                <div class="form-group full">
                                    <label>Ảnh đại diện</label>
                                    <div class="input-mode-switch">
                                        <button type="button" class="mode-btn" :class="{ active: photoInputMode === 'url' }" @click="setPhotoMode('url')">
                                            Nhập link ảnh
                                        </button>
                                        <button type="button" class="mode-btn" :class="{ active: photoInputMode === 'upload' }" @click="setPhotoMode('upload')">
                                            Upload lên Cloudinary
                                        </button>
                                    </div>

                                    <div v-if="photoInputMode === 'url'" class="photo-input-url">
                                        <input
                                            v-model.trim="formData.photoUrl"
                                            @input="clearError('photoUrl')"
                                            type="url"
                                            class="form-control"
                                            :class="{ 'is-invalid': !!formErrors.photoUrl }"
                                            placeholder="https://example.com/photo.jpg"
                                        >
                                        <p v-if="formErrors.photoUrl" class="field-error">{{ formErrors.photoUrl }}</p>
                                    </div>

                                    <div v-else class="photo-input-upload">
                                        <input
                                            ref="photoFileInput"
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp,image/gif"
                                            class="hidden-file-input"
                                            @change="onPhotoFileChange"
                                        >
                                        <button type="button" class="btn btn-secondary btn-upload-inline" :disabled="photoUploading || saving" @click="triggerPhotoPicker">
                                            <i class="fas" :class="photoUploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
                                            {{ photoUploading ? 'Đang upload...' : 'Chọn ảnh' }}
                                        </button>
                                        <span class="upload-inline-hint">PNG/JPG/WEBP/GIF, tối đa 2MB</span>
                                    </div>
                                </div>
                            </div>

                            <div class="form-col">
                                <div class="image-preview-card">
                                    <p class="image-preview-title">Xem trước ảnh</p>
                                    <div class="image-preview-surface">
                                        <img v-if="photoPreviewSrc" :src="photoPreviewSrc" alt="Photo preview" class="image-preview">
                                        <div v-else class="image-preview-empty">
                                            <i class="fas fa-image"></i>
                                            <p>Chưa có ảnh để xem trước</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Social Links -->
                    <div class="section">
                        <div class="section-header">
                            <h3><i class="fas fa-share-alt"></i> Liên hệ xã hội</h3>
                        </div>

                        <div class="form-grid two-columns">
                            <div class="form-group">
                                <label>Facebook URL</label>
                                <input
                                    v-model.trim="formData.socialLinks.facebook"
                                    @input="clearError('facebook')"
                                    type="url"
                                    class="form-control"
                                    :class="{ 'is-invalid': !!formErrors.facebook }"
                                    placeholder="https://facebook.com/username"
                                >
                                <p v-if="formErrors.facebook" class="field-error">{{ formErrors.facebook }}</p>
                            </div>

                            <div class="form-group">
                                <label>TikTok URL</label>
                                <input
                                    v-model.trim="formData.socialLinks.tiktok"
                                    @input="clearError('tiktok')"
                                    type="url"
                                    class="form-control"
                                    :class="{ 'is-invalid': !!formErrors.tiktok }"
                                    placeholder="https://tiktok.com/@username"
                                >
                                <p v-if="formErrors.tiktok" class="field-error">{{ formErrors.tiktok }}</p>
                            </div>

                            <div class="form-group full">
                                <label>Email</label>
                                <input
                                    v-model.trim="formData.socialLinks.email"
                                    @input="clearError('email')"
                                    type="email"
                                    class="form-control"
                                    :class="{ 'is-invalid': !!formErrors.email }"
                                    placeholder="email@example.com"
                                >
                                <p v-if="formErrors.email" class="field-error">{{ formErrors.email }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="form-actions">
                        <NuxtLink to="/admin/team-members" class="btn btn-secondary">
                            <i class="fas fa-times"></i>
                            Hủy
                        </NuxtLink>
                        <button type="submit" class="btn btn-primary" :disabled="saving">
                            <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                            {{ saving ? 'Đang lưu...' : 'Lưu thành viên' }}
                        </button>
                    </div>
                </form>
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

const route = useRoute()
const router = useRouter()
const memberId = route.params.id

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'permission'],
    ssr: false
})

useHead({
    title: memberId ? 'Chỉnh sửa Thành viên - Admin' : 'Thêm Thành viên - Admin'
})

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2, 3]))

const loading = ref(false)
const saving = ref(false)
const photoUploading = ref(false)
const photoInputMode = ref('url')

const photoFileInput = ref(null)
const photoPreviewTempUrl = ref('')
const pendingPhotoFile = ref(null)

const formData = reactive({
    name: '',
    position: '',
    description: '',
    photoUrl: '',
    photoPublicId: '',
    socialLinks: {
        facebook: '',
        tiktok: '',
        email: ''
    },
    sortOrder: 0,
    isActive: true
})

const formErrors = reactive({
    name: '',
    position: '',
    photoUrl: '',
    facebook: '',
    tiktok: '',
    email: ''
})

const photoPreviewSrc = computed(() => {
    return String(photoPreviewTempUrl.value || formData.photoUrl || '').trim()
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

const clearError = (field) => {
    if (formErrors[field]) formErrors[field] = ''
}

const validateForm = () => {
    formErrors.name = ''
    formErrors.position = ''
    formErrors.photoUrl = ''
    formErrors.facebook = ''
    formErrors.tiktok = ''
    formErrors.email = ''

    if (!formData.name.trim()) {
        formErrors.name = 'Tên là bắt buộc'
    } else if (formData.name.trim().length < 2) {
        formErrors.name = 'Tên phải có ít nhất 2 ký tự'
    }

    if (!formData.position.trim()) {
        formErrors.position = 'Vị trí là bắt buộc'
    }

    if (photoInputMode.value === 'url') {
        if (formData.photoUrl && !isValidUrl(formData.photoUrl)) {
            formErrors.photoUrl = 'URL ảnh không hợp lệ'
        }
    } else if (!pendingPhotoFile.value && !formData.photoUrl) {
        formErrors.photoUrl = 'Bạn phải chọn ảnh để upload hoặc chuyển sang chế độ nhập link'
    }

    if (formData.socialLinks.facebook && !isValidUrl(formData.socialLinks.facebook)) {
        formErrors.facebook = 'Facebook URL không hợp lệ'
    }

    if (formData.socialLinks.tiktok && !isValidUrl(formData.socialLinks.tiktok)) {
        formErrors.tiktok = 'TikTok URL không hợp lệ'
    }

    if (formData.socialLinks.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.socialLinks.email)) {
        formErrors.email = 'Email không hợp lệ'
    }

    return !Object.values(formErrors).some(Boolean)
}

const setPhotoMode = (mode) => {
    if (!['url', 'upload'].includes(mode)) return
    photoInputMode.value = mode
    clearError('photoUrl')
    if (mode === 'url') {
        pendingPhotoFile.value = null
        resetPhotoPreview()
    }
}

const triggerPhotoPicker = () => {
    photoFileInput.value?.click()
}

const resetPhotoPreview = () => {
    if (photoPreviewTempUrl.value) {
        URL.revokeObjectURL(photoPreviewTempUrl.value)
        photoPreviewTempUrl.value = ''
    }
}

const onPhotoFileChange = async (event) => {
    const file = event?.target?.files?.[0]
    event.target.value = ''

    if (!file) return

    const fileType = String(file?.type || '').toLowerCase()
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(fileType)) {
        showError('Định dạng file ảnh không hợp lệ (chỉ nhận PNG/JPG/WEBP/GIF)')
        return
    }

    const maxFileSize = 2 * 1024 * 1024
    if (file.size > maxFileSize) {
        showError('File ảnh vượt quá 2MB')
        return
    }

    pendingPhotoFile.value = file

    const previewUrl = URL.createObjectURL(file)
    resetPhotoPreview()
    photoPreviewTempUrl.value = previewUrl
}

const uploadPhotoToCloudinary = async (file) => {
    const fileType = String(file?.type || '').toLowerCase()
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(fileType)) {
        throw new Error('Định dạng file ảnh không hợp lệ (chỉ nhận PNG/JPG/WEBP/GIF)')
    }

    const maxFileSize = 2 * 1024 * 1024
    if (file.size > maxFileSize) {
        throw new Error('File ảnh vượt quá 2MB')
    }

    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${API_BASE}/about/team-members/upload-image`, {
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

const fetchMember = async () => {
    if (!memberId) return

    loading.value = true
    try {
        // Note: Create a public endpoint for getting single member for admin
        const response = await fetch(`${API_BASE}/about/team-members/${memberId}`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        const member = data?.data
        formData.name = member.name || ''
        formData.position = member.position || ''
        formData.description = member.description || ''
        formData.photoUrl = member.photo_url || ''
        formData.photoPublicId = member.photo_cloudinary_public_id || ''
        formData.socialLinks = member.social_links || { facebook: '', tiktok: '', email: '' }
        formData.sortOrder = member.sort_order || 0
        formData.isActive = member.is_active !== false

        photoInputMode.value = formData.photoUrl ? 'url' : 'upload'
    } catch (error) {
        showError(error.message || 'Không thể tải thông tin thành viên')
    } finally {
        loading.value = false
    }
}

const saveMember = async () => {
    if (!validateForm()) {
        showError('Vui lòng kiểm tra lại thông tin')
        return
    }

    saving.value = true
    try {
        let photoUrl = formData.photoUrl
        let photoPublicId = formData.photoPublicId

        // Upload photo if needed
        if (photoInputMode.value === 'upload' && pendingPhotoFile.value) {
            photoUploading.value = true
            const uploadResult = await uploadPhotoToCloudinary(pendingPhotoFile.value)
            photoUrl = uploadResult.uploadedUrl
            photoPublicId = uploadResult.uploadedPublicId
            photoUploading.value = false
        }

        const payload = {
            name: formData.name.trim(),
            position: formData.position.trim(),
            description: formData.description.trim(),
            photoUrl: photoUrl,
            photoPublicId: photoPublicId,
            socialLinks: {
                facebook: formData.socialLinks.facebook.trim(),
                tiktok: formData.socialLinks.tiktok.trim(),
                email: formData.socialLinks.email.trim()
            },
            sortOrder: Number(formData.sortOrder),
            isActive: formData.isActive
        }

        const url = memberId
            ? `${API_BASE}/about/team-members/${memberId}`
            : `${API_BASE}/about/team-members`
        
        const method = memberId ? 'PUT' : 'POST'

        const response = await fetch(url, {
            method,
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        showSuccess(data?.message || (memberId ? 'Cập nhật thành công' : 'Tạo thành công'))
        router.push('/admin/team-members')
    } catch (error) {
        showError(error.message || 'Không thể lưu thành viên')
    } finally {
        saving.value = false
        photoUploading.value = false
    }
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await fetchMember()
    }
})
</script>

<style scoped>
.team-member-form-page {
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
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1.5rem 0;
    border-bottom: 2px solid #eee;
}

.header-content h1 {
    color: #333;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 2rem;
}

.header-content h1 i {
    color: #1976d2;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
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

/* .form-wrapper {
    max-width: 900px;
} */

.form-section {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.section {
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
}

.section:last-of-type {
    border-bottom: none;
}

.section-header {
    margin-bottom: 1.25rem;
}

.section-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 10px;
}

.section-header h3 i {
    color: #1976d2;
}

.form-grid {
    display: grid;
    gap: 1rem;
}

.form-grid.two-columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-grid.full-width {
    grid-template-columns: 1fr;
}

.form-col {
    min-width: 0;
}

.form-grid.full-width {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
}

.form-group.full {
    grid-column: 1 / -1;
}

.form-group label {
    color: #333;
    font-weight: 600;
    font-size: 0.95rem;
}

.form-control {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.7rem 0.8rem;
    font-size: 0.95rem;
    color: #333;
    background: #fff;
    font-family: inherit;
}

.form-control:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.14);
}

.form-control.is-invalid {
    border-color: #dc3545;
}

.field-error {
    margin: 0;
    color: #dc3545;
    font-size: 0.85rem;
}

.field-hint {
    color: #6c757d;
    font-size: 0.82rem;
}

.required {
    color: #dc3545;
}

.input-mode-switch {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.mode-btn {
    flex: 1;
    padding: 0.6rem 0.8rem;
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    color: #666;
    transition: all 0.2s;
    font-size: 0.9rem;
}

.mode-btn:hover {
    border-color: #1976d2;
    color: #1976d2;
}

.mode-btn.active {
    background: #1976d2;
    border-color: #1976d2;
    color: #fff;
}

.photo-input-url,
.photo-input-upload {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.hidden-file-input {
    display: none;
}

.btn-upload-inline {
    width: 100%;
}

.upload-inline-hint {
    color: #6c757d;
    font-size: 0.82rem;
}

.image-preview-card {
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
}

.image-preview-title {
    padding: 0.75rem 1rem;
    margin: 0;
    background: #f8f9fa;
    border-bottom: 1px solid #eee;
    font-size: 0.9rem;
    font-weight: 500;
    color: #333;
}

.image-preview-surface {
    width: 100%;
    height: 220px;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-preview-empty {
    text-align: center;
    color: #999;
}

.image-preview-empty i {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    display: block;
}

.form-actions {
    padding: 1.5rem;
    background: #f8f9fa;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
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

@media (max-width: 992px) {
    .form-grid.two-columns,
    .form-grid.full-width {
        grid-template-columns: 1fr;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 640px) {
    .header-content h1 {
        font-size: 1.45rem;
    }

    .section {
        padding: 1rem;
    }

    .form-actions {
        padding: 1rem;
    }
}
</style>
