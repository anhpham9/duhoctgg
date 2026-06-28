<template>
    <div class="about-content-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Không thể truy cập Quản lý Nội dung</h3>
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
                    <h1><i class="fas fa-file-alt"></i> Quản lý Nội dung - Về chúng tôi</h1>
                    <p>Chỉ quản lý 2 section cố định: content và history</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" :disabled="loading" @click="fetchContent">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                        Làm mới
                    </button>
                    <button v-if="canCreateNew" class="btn btn-primary" @click="showAddForm">
                        <i class="fas fa-plus"></i>
                        Thêm mới
                    </button>
                </div>
            </div>

            <div v-if="loading" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải dữ liệu...</p>
            </div>

            <div v-else class="content-wrapper">
                <div v-if="showForm" class="form-section">
                    <div class="form-header">
                        <h3>
                            <i class="fas" :class="editingId ? 'fa-edit' : 'fa-plus'"></i>
                            {{ editingId ? 'Cập nhật' : 'Thêm mới' }}
                        </h3>
                        <button class="btn-close" type="button" @click="closeForm">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <form class="item-form" @submit.prevent="saveItem">
                        <div class="form-grid">
                            <div class="form-group full">
                                <label>Khóa Section <span class="required">*</span></label>
                                <select
                                    v-if="!editingId"
                                    v-model="formData.sectionKey"
                                    class="form-control"
                                    :class="{ 'is-invalid': !!formErrors.sectionKey }"
                                    @change="handleSectionKeyChange"
                                >
                                    <option value="">Chọn section</option>
                                    <option v-for="option in createSectionOptions" :key="option.value" :value="option.value">
                                        {{ option.label }}
                                    </option>
                                </select>
                                <input
                                    v-else
                                    :value="formData.sectionKey"
                                    class="form-control"
                                    disabled
                                    type="text"
                                >
                                <p v-if="formErrors.sectionKey" class="field-error">{{ formErrors.sectionKey }}</p>
                            </div>

                            <div class="form-group full">
                                <label>Tiêu đề <span class="required">*</span></label>
                                <input v-model.trim="formData.title" type="text" class="form-control" maxlength="255">
                            </div>

                            <div class="form-group full">
                                <label>Subtitle</label>
                                <input v-model.trim="formData.subtitle" type="text" class="form-control" maxlength="255">
                            </div>

                            <div class="form-group full">
                                <label>Type</label>
                                <input :value="formData.type" type="text" class="form-control" disabled>
                                <small class="field-hint">{{ formData.type === 'timeline' ? 'Timeline: chỉ nhập mốc năm + nội dung' : 'paragraph: nội dung + ảnh' }}</small>
                            </div>

                            <template v-if="formData.type !== 'timeline'">
                                <div class="form-group full">
                                    <label>Nội dung <span class="required">*</span></label>
                                    <textarea v-model.trim="formData.content" class="form-control" rows="8"></textarea>
                                </div>

                                <div class="form-group full">
                                    <label>Hình ảnh</label>
                                    <div class="input-mode-switch">
                                        <button type="button" class="mode-btn" :class="{ active: imageMode === 'url' }" @click="imageMode = 'url'">Nhập link ảnh</button>
                                        <button type="button" class="mode-btn" :class="{ active: imageMode === 'upload' }" @click="imageMode = 'upload'">Upload lên Cloudinary</button>
                                    </div>

                                    <input v-if="imageMode === 'url'" v-model.trim="formData.imageUrl" type="url" class="form-control" placeholder="https://example.com/image.jpg">

                                    <div v-else class="upload-actions">
                                        <input ref="imageFileInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden-file-input" @change="onImageFileChange">
                                        <button type="button" class="btn btn-secondary" :disabled="imageUploading || saving" @click="triggerImagePicker">
                                            <i class="fas" :class="imageUploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
                                            {{ imageUploading ? 'Đang upload...' : 'Chọn ảnh' }}
                                        </button>
                                    </div>
                                </div>
                            </template>

                            <div v-else class="form-group full timeline-editor">
                                <div class="timeline-editor-header">
                                    <label>Timeline items</label>
                                    <button type="button" class="btn btn-primary btn-sm" @click="addTimelineItem">
                                        <i class="fas fa-plus"></i>
                                        Thêm mốc
                                    </button>
                                </div>

                                <div v-if="formData.timelineItems.length === 0" class="empty-state timeline-empty">
                                    <p>Chưa có mốc timeline nào. Hãy thêm ít nhất một mốc.</p>
                                </div>

                                <div v-for="(timelineItem, index) in formData.timelineItems" :key="`timeline-${index}`" class="timeline-item-editor">
                                    <div class="timeline-item-editor-header">
                                        <strong>Mốc {{ index + 1 }}</strong>
                                        <button type="button" class="btn-icon btn-danger" @click="removeTimelineItem(index)">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                    <div class="form-grid timeline-grid">
                                        <div class="form-group">
                                            <label>Năm <span class="required">*</span></label>
                                            <input v-model.trim="timelineItem.year" type="text" class="form-control" placeholder="2020" maxlength="10">
                                        </div>
                                        <div class="form-group full">
                                            <label>Tiêu đề <span class="required">*</span></label>
                                            <input v-model.trim="timelineItem.title" type="text" class="form-control" placeholder="Thành lập công ty" maxlength="255">
                                        </div>
                                        <div class="form-group full">
                                            <label>Nội dung <span class="required">*</span></label>
                                            <textarea v-model.trim="timelineItem.content" class="form-control" rows="4" placeholder="Mô tả chi tiết mốc phát triển..."></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Thứ tự sắp xếp</label>
                                <input v-model.number="formData.sortOrder" type="number" class="form-control" placeholder="0">
                            </div>

                            <div class="form-group">
                                <label>Trạng thái</label>
                                <select v-model="formData.isActive" class="form-control">
                                    <option :value="true">Kích hoạt</option>
                                    <option :value="false">Ẩn</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" @click="closeForm">
                                <i class="fas fa-times"></i>
                                Hủy
                            </button>
                            <button type="submit" class="btn btn-primary" :disabled="saving">
                                <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                                {{ saving ? 'Đang lưu...' : 'Lưu' }}
                            </button>
                        </div>
                    </form>
                </div>

                <div class="content-list">
                    <div v-if="items.length === 0" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>Chưa có nội dung nào. Hãy tạo content và history.</p>
                    </div>

                    <div v-else class="content-table-wrapper">
                        <table class="content-table">
                            <thead>
                                <tr>
                                    <th>Khóa Section</th>
                                    <th>Type</th>
                                    <th>Tiêu đề</th>
                                    <th>Subtitle</th>
                                    <th>Preview</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in items" :key="item.id">
                                    <td><code>{{ item.section_key }}</code></td>
                                    <td>
                                        <span class="badge" :class="item.type === 'timeline' ? 'badge-timeline' : 'badge-content'">{{ item.type }}</span>
                                    </td>
                                    <td>{{ item.title }}</td>
                                    <td class="preview-cell">{{ truncateText(item.subtitle, 45) }}</td>
                                    <td class="preview-cell">
                                        {{ item.type === 'timeline' ? `${item.timeline_items?.length || 0} mốc timeline` : truncateText(item.content, 60) }}
                                    </td>
                                    <td>
                                        <button class="btn-icon" type="button" @click="editItem(item)"><i class="fas fa-edit"></i></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Toast />
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { useNotifications } from '~/composables/useNotifications'

definePageMeta({ layout: 'admin', middleware: ['auth', 'permission'], ssr: false })

useHead({ title: 'Quản lý Nội dung - Về chúng tôi' })

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase
const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2, 3]))
const items = ref([])
const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)
const editingId = ref(null)
const imageMode = ref('url')
const imageUploading = ref(false)
const imageFileInput = ref(null)
const pendingImageFile = ref(null)

const createSectionOptions = computed(() => {
    const existing = items.value.map((item) => String(item.section_key || '').trim())
    return [
        { value: 'content', label: 'Nội dung' },
        { value: 'history', label: 'Lịch sử phát triển' }
    ].filter((option) => !existing.includes(option.value))
})

const canCreateNew = computed(() => items.value.length < 2)

const formData = reactive({
    sectionKey: '',
    type: 'paragraph',
    title: '',
    subtitle: '',
    content: '',
    imageUrl: '',
    imagePublicId: '',
    sortOrder: 0,
    isActive: true,
    timelineItems: []
})

const formErrors = reactive({ sectionKey: '', title: '', subtitle: '', content: '', imageUrl: '' })

const syncTypeBySection = (sectionKey) => {
    formData.type = sectionKey === 'history' ? 'timeline' : 'paragraph'
}

const handleSectionKeyChange = () => syncTypeBySection(formData.sectionKey)

const addTimelineItem = () => {
    formData.timelineItems.push({ year: '', title: '', content: '' })
}

const removeTimelineItem = (index) => {
    formData.timelineItems.splice(index, 1)
}

const clearError = (field) => {
    formErrors[field] = ''
}

const truncateText = (text, length) => {
    const value = String(text || '')
    return value.length > length ? `${value.slice(0, length)}...` : value
}

const normalizeTimelineItems = (value) => {
    const rows = Array.isArray(value) ? value : []
    return rows
        .map((item) => ({
            year: String(item.year || '').trim(),
            title: String(item.title || item.content || '').trim(),
            content: String(item.content || '').trim()
        }))
        .filter((item) => item.year && item.content)
}

const validateForm = () => {
    Object.keys(formErrors).forEach((key) => { formErrors[key] = '' })

    if (!formData.sectionKey.trim() && !editingId.value) formErrors.sectionKey = 'Khóa section là bắt buộc'
    if (!formData.title.trim()) formErrors.title = 'Tiêu đề là bắt buộc'
    if (String(formData.subtitle || '').trim().length > 255) formErrors.subtitle = 'Subtitle tối đa 255 ký tự'

    if (formData.type === 'timeline') {
        const validItems = normalizeTimelineItems(formData.timelineItems)
        if (validItems.length === 0) formErrors.content = 'Timeline phải có ít nhất một mốc'
    } else if (!formData.content.trim()) {
        formErrors.content = 'Nội dung là bắt buộc'
    }

    return !Object.values(formErrors).some(Boolean)
}

const showAddForm = () => {
    editingId.value = null
    const defaultSection = createSectionOptions.value[0]?.value || 'content'
    formData.sectionKey = defaultSection
    syncTypeBySection(defaultSection)
    formData.title = ''
    formData.subtitle = ''
    formData.content = ''
    formData.imageUrl = ''
    formData.imagePublicId = ''
    formData.sortOrder = 0
    formData.isActive = true
    formData.timelineItems = formData.type === 'timeline' ? [{ year: '', title: '', content: '' }] : []
    imageMode.value = 'url'
    pendingImageFile.value = null
    showForm.value = true
}

const closeForm = () => {
    showForm.value = false
    editingId.value = null
}

const editItem = (item) => {
    editingId.value = item.id
    formData.sectionKey = String(item.section_key || '').trim()
    formData.type = String(item.type || (formData.sectionKey === 'history' ? 'timeline' : 'paragraph')).trim()
    formData.title = item.title || ''
    formData.subtitle = item.subtitle || ''
    formData.content = item.content || ''
    formData.imageUrl = item.image_url || ''
    formData.imagePublicId = item.image_cloudinary_public_id || ''
    formData.sortOrder = item.sort_order || 0
    formData.isActive = item.is_active !== false
    formData.timelineItems = normalizeTimelineItems(item.timeline_items)
    if (formData.type === 'timeline' && formData.timelineItems.length === 0) formData.timelineItems = [{ year: '', title: '', content: '' }]
    imageMode.value = formData.imageUrl ? 'url' : 'upload'
    pendingImageFile.value = null
    showForm.value = true
}

const triggerImagePicker = () => imageFileInput.value?.click()

const onImageFileChange = (event) => {
    const file = event?.target?.files?.[0]
    event.target.value = ''
    if (!file) return
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(String(file.type || '').toLowerCase())) return showError('Định dạng file ảnh không hợp lệ')
    if (file.size > 5 * 1024 * 1024) return showError('File ảnh vượt quá 5MB')
    pendingImageFile.value = file
    formData.imageUrl = file.name
}

const uploadImageToCloudinary = async (file) => {
    const uploadFormData = new FormData()
    uploadFormData.append('image', file)
    const response = await fetch(`${API_BASE}/about/team-members/upload-image`, { method: 'POST', credentials: 'include', body: uploadFormData })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.message || 'Upload ảnh thất bại')
    return { uploadedUrl: String(data?.data?.url || '').trim(), uploadedPublicId: String(data?.data?.publicId || '').trim() }
}

const fetchContent = async () => {
    loading.value = true
    try {
        const response = await fetch(`${API_BASE}/about/content/admin`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`)
        items.value = Array.isArray(data?.data) ? data.data : []
    } catch (error) {
        showError(error?.message || 'Không thể tải nội dung')
    } finally {
        loading.value = false
    }
}

const saveItem = async () => {
    if (!validateForm()) return showError('Vui lòng kiểm tra lại thông tin')

    saving.value = true
    try {
        let imageUrl = formData.imageUrl
        let imagePublicId = formData.imagePublicId
        let content = String(formData.content || '').trim()
        let timelineItems = []

        if (formData.type === 'timeline') {
            timelineItems = normalizeTimelineItems(formData.timelineItems)
            imageUrl = ''
            imagePublicId = ''
            content = ''
        } else if (imageMode.value === 'upload' && pendingImageFile.value) {
            imageUploading.value = true
            const uploadResult = await uploadImageToCloudinary(pendingImageFile.value)
            imageUrl = uploadResult.uploadedUrl
            imagePublicId = uploadResult.uploadedPublicId
        }

        const payload = {
            title: formData.title.trim(),
            subtitle: String(formData.subtitle || '').trim(),
            type: formData.type,
            content,
            timelineItems,
            imageUrl,
            imagePublicId,
            sortOrder: Number(formData.sortOrder),
            isActive: formData.isActive
        }

        if (!editingId.value) payload.sectionKey = formData.sectionKey.trim()

        const url = editingId.value ? `${API_BASE}/about/content/${editingId.value}` : `${API_BASE}/about/content`
        const method = editingId.value ? 'PUT' : 'POST'
        const response = await fetch(url, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`)

        showSuccess(data?.message || 'Lưu thành công')
        closeForm()
        await fetchContent()
    } catch (error) {
        showError(error?.message || 'Không thể lưu nội dung')
    } finally {
        saving.value = false
        imageUploading.value = false
    }
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) await fetchContent()
})
</script>

<style scoped>
.about-content-page { min-height: 100vh; }
.permission-check { display:flex; align-items:center; justify-content:center; min-height:60vh; padding:2rem; }
.loading-permission, .permission-denied, .form-section, .content-list, .loading-state { background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,.08); }
.permission-denied, .loading-permission, .loading-state { text-align:center; padding:3rem 2rem; }
.page-header { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:1.5rem; padding:1.5rem 0; border-bottom:2px solid #eee; }
.header-content h1 { margin:0 0 .5rem; display:flex; align-items:center; gap:12px; font-size:2rem; }
.header-actions { display:flex; gap:.75rem; flex-wrap:wrap; }
.form-section { padding:1.5rem; margin-bottom:2rem; }
.form-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; border-bottom:2px solid #f0f0f0; padding-bottom:1rem; }
.item-form { display:flex; flex-direction:column; gap:1.5rem; }
.form-grid { display:grid; gap:1rem; grid-template-columns:repeat(2, 1fr); }
.form-group.full { grid-column:1 / -1; }
.form-control, select { width:100%; border:1px solid #ddd; border-radius:6px; padding:.7rem .8rem; }
.input-mode-switch { display:flex; gap:.5rem; margin-bottom:.5rem; }
.mode-btn { flex:1; padding:.6rem .8rem; border:1px solid #d1d5db; border-radius:6px; background:#f8fafc; cursor:pointer; }
.mode-btn.active { border-color:#1976d2; background:#e3f2fd; color:#1565c0; }
.upload-actions { display:flex; gap:.5rem; }
.hidden-file-input { display:none; }
.timeline-editor-header, .timeline-item-editor-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:.75rem; }
.timeline-item-editor { border:1px solid #e5e7eb; border-radius:10px; padding:1rem; margin-top:1rem; background:#fafafa; }
.timeline-grid { grid-template-columns:repeat(2, 1fr); }
.empty-state { padding:2rem; text-align:center; color:#999; }
.content-table-wrapper { overflow-x:auto; }
.content-table { width:100%; border-collapse:collapse; }
.content-table th, .content-table td { padding:1rem; border-bottom:1px solid #e5e7eb; text-align:left; }
.preview-cell { max-width:260px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.badge { display:inline-block; padding:.3rem .6rem; border-radius:999px; font-size:.8rem; font-weight:600; }
.badge-content { background:#dcfce7; color:#166534; }
.badge-timeline { background:#dbeafe; color:#1d4ed8; }
.btn-icon { background:none; border:none; cursor:pointer; color:#1976d2; padding:.4rem; }
.btn-icon.btn-danger { color:#dc3545; }
.field-error { margin:0; color:#dc3545; font-size:.85rem; }
.field-hint { color:#6c757d; font-size:.82rem; }
.required { color:#dc3545; }
@media (max-width: 768px) {
    .page-header { flex-direction:column; }
    .form-grid, .timeline-grid { grid-template-columns:1fr; }
}
</style>
