<template>
    <div class="socials-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Không thể truy cập Cài đặt Mạng xã hội</h3>
                <p>Chỉ Superadmin và Admin mới có thể cập nhật cài đặt này.</p>
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
                        <i class="fas fa-share-alt"></i>
                        Mạng xã hội & Liên kết
                    </h1>
                    <p>Quản lý các liên kết mạng xã hội và thông tin liên hệ của website.</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" :disabled="loading" @click="fetchSocialLinks">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                        Làm mới
                    </button>
                    <button class="btn btn-success" @click="showAddForm = !showAddForm">
                        <i class="fas fa-plus"></i>
                        {{ showAddForm ? 'Đóng' : 'Thêm liên kết' }}
                    </button>
                </div>
            </div>

            <!-- Add/Edit Form -->
            <div v-if="showAddForm" class="add-form-card">
                <h3>{{ editingId ? 'Chỉnh sửa liên kết' : 'Thêm liên kết mới' }}</h3>

                <form @submit.prevent="saveLink" class="form">
                    <div class="form-group">
                        <label>Tên liên kết <span class="required">*</span></label>
                        <input v-model.trim="formData.name" type="text" class="form-control"
                            :class="{ 'is-invalid': !!formErrors.name }" placeholder="ví dụ: Facebook" maxlength="100">
                        <p v-if="formErrors.name" class="field-error">{{ formErrors.name }}</p>
                    </div>

                    <!-- <div class="form-group">
                        <label>Icon <span class="required">*</span></label>
                        <input
                            v-model.trim="formData.icon"
                            type="text"
                            class="form-control"
                            :class="{ 'is-invalid': !!formErrors.icon }"
                            placeholder="ví dụ: fab fa-facebook"
                            maxlength="100"
                        >
                        <p v-if="formErrors.icon" class="field-error">{{ formErrors.icon }}</p>
                        <small>Dùng Font Awesome icons (ví dụ: fab fa-facebook, fab fa-twitter)</small>
                    </div> -->

                    <div class="form-group">
                        <label>Icon <span class="required">*</span></label>

                        <select v-model="formData.icon" class="form-control"
                            :class="{ 'is-invalid': !!formErrors.icon }">
                            <option value="">-- Chọn icon mạng xã hội --</option>
                            <option v-for="opt in SOCIAL_ICON_OPTIONS" :key="opt.value" :value="opt.value">
                                {{ opt.label }} ({{ opt.value }})
                            </option>
                        </select>

                        <p v-if="formErrors.icon" class="field-error">{{ formErrors.icon }}</p>

                        <div v-if="formData.icon" class="icon-preview">
                            <span>Xem trước:</span>
                            <i :class="formData.icon"></i>
                            <code>{{ formData.icon }}</code>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>URL <span class="required">*</span></label>
                        <input v-model.trim="formData.url" type="url" class="form-control"
                            :class="{ 'is-invalid': !!formErrors.url }" placeholder="https://facebook.com/yourpage">
                        <p v-if="formErrors.url" class="field-error">{{ formErrors.url }}</p>
                    </div>

                    <div class="form-group">
                        <label>Mô tả</label>
                        <textarea v-model="formData.description" class="form-control" rows="2"
                            placeholder="Mô tả ngắn về liên kết này" maxlength="500"></textarea>
                    </div>

                    <div class="form-group">
                        <label>Thứ tự hiển thị <span class="required">*</span></label>
                        <input v-model.number="formData.display_order" type="number" class="form-control"
                            :class="{ 'is-invalid': !!formErrors.display_order }" min="0">
                        <p v-if="formErrors.display_order" class="field-error">{{ formErrors.display_order }}</p>
                    </div>

                    <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                            <input v-model="formData.is_active" type="checkbox">
                            <span>Kích hoạt liên kết này</span>
                        </label>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" @click="resetForm">
                            <i class="fas fa-times"></i>
                            Hủy
                        </button>
                        <button type="submit" class="btn btn-primary" :disabled="saving">
                            <i :class="saving ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
                            {{ saving ? 'Đang lưu...' : 'Lưu' }}
                        </button>
                    </div>
                </form>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải dữ liệu...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Lỗi: {{ error }}</p>
                <button @click="fetchSocialLinks" class="btn btn-primary">Thử lại</button>
            </div>

            <!-- Social Links Table -->
            <div v-else class="table-container">
                <table v-if="socialLinks.length > 0" class="table">
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Icon</th>
                            <th>URL</th>
                            <th>Thứ tự</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="link in socialLinks" :key="link.id" class="table-row">
                            <td class="name-col">{{ link.name }}</td>
                            <td class="icon-col">
                                <i :class="link.icon"></i>
                                {{ link.icon }}
                            </td>
                            <td class="url-col">
                                <a :href="link.url" target="_blank" rel="noopener">{{ link.url }}</a>
                            </td>
                            <td class="order-col">{{ link.display_order }}</td>
                            <td class="status-col">
                                <span :class="['badge', link.is_active ? 'badge-success' : 'badge-danger']">
                                    {{ link.is_active ? 'Kích hoạt' : 'Vô hiệu' }}
                                </span>
                            </td>
                            <td class="action-col">
                                <button class="btn-edit" :disabled="saving" @click="editLink(link)" title="Chỉnh sửa">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-delete" :disabled="saving || deletingId === link.id"
                                    @click="deleteLink(link.id, link.name)" title="Xóa">
                                    <i :class="deletingId === link.id ? 'fas fa-spinner fa-spin' : 'fas fa-trash'"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-else class="empty-state">
                    <i class="fas fa-link"></i>
                    <p>Chưa có liên kết nào</p>
                    <p class="hint">Nhấn "Thêm liên kết" để tạo liên kết mới</p>
                </div>
            </div>
        </div>

        <div v-if="showDeleteConfirm && linkToDelete" class="modal-overlay">
            <div class="modal modal-small" @click.stop>
                <div class="modal-header">
                    <h3>Xác nhận xóa</h3>
                    <button @click="closeDeleteConfirm" class="btn-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="delete-confirmation">
                        <i class="fas fa-exclamation-triangle warning-icon"></i>
                        <p>Bạn có chắc chắn muốn xóa link social <strong>{{ linkToDelete.name }}</strong>?</p>
                        <p class="warning-text">Thao tác này không thể hoàn tác!</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="closeDeleteConfirm" type="button" class="btn btn-secondary">Hủy</button>
                    <button @click="confirmDeleteLink" type="button" class="btn btn-danger"
                        :disabled="deletingId === linkToDelete.id">
                        <i v-if="deletingId === linkToDelete.id" class="fas fa-spinner fa-spin"></i>
                        {{ deletingId === linkToDelete.id ? 'Đang xóa...' : 'Xóa link' }}
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
    title: 'Mạng xã hội - Admin'
})

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError, showInfo } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2]))
const canDelete = computed(() => hasAnyRole([1, 2]))
const loading = ref(false)
const saving = ref(false)
// const deleting = ref(null)
const error = ref('')
const showAddForm = ref(false)
const editingId = ref(null)
const socialLinks = ref([])


const deletingId = ref(null)
const showDeleteConfirm = ref(false)
const linkToDelete = ref(null)

const formData = reactive({
    name: '',
    icon: '',
    url: '',
    description: '',
    display_order: 0,
    is_active: true
})

const formErrors = reactive({
    name: '',
    icon: '',
    url: '',
    description: '',
    display_order: ''
})

// icon
const SOCIAL_ICON_OPTIONS = [
    { label: 'Facebook', value: 'fa-brands fa-facebook' },
    { label: 'Zalo', value: 'fa-zalo' },
    { label: 'Facebook F', value: 'fa-brands fa-facebook-f' },
    { label: 'Facebook Messenger', value: 'fa-brands fa-facebook-messenger' },
    { label: 'Instagram', value: 'fa-brands fa-instagram' },
    { label: 'Twitter', value: 'fa-brands fa-twitter' }, // FA 6.0.0
    { label: 'YouTube', value: 'fa-brands fa-youtube' },
    { label: 'TikTok', value: 'fa-brands fa-tiktok' },
    { label: 'LinkedIn', value: 'fa-brands fa-linkedin' },
    { label: 'LinkedIn In', value: 'fa-brands fa-linkedin-in' },
    { label: 'GitHub', value: 'fa-brands fa-github' },
    { label: 'GitLab', value: 'fa-brands fa-gitlab' },
    { label: 'Discord', value: 'fa-brands fa-discord' },
    { label: 'Telegram', value: 'fa-brands fa-telegram' },
    { label: 'WhatsApp', value: 'fa-brands fa-whatsapp' },
    { label: 'Pinterest', value: 'fa-brands fa-pinterest' },
    { label: 'Reddit', value: 'fa-brands fa-reddit' },
    { label: 'Snapchat', value: 'fa-brands fa-snapchat' },
    { label: 'Tumblr', value: 'fa-brands fa-tumblr' },
    { label: 'Twitch', value: 'fa-brands fa-twitch' },
    { label: 'Viber', value: 'fa-brands fa-viber' },
    { label: 'Weixin', value: 'fa-brands fa-weixin' },
    { label: 'QQ', value: 'fa-brands fa-qq' },
    { label: 'Weibo', value: 'fa-brands fa-weibo' },
    { label: 'Line', value: 'fa-brands fa-line' },
    { label: 'Skype', value: 'fa-brands fa-skype' },
    { label: 'Stack Overflow', value: 'fa-brands fa-stack-overflow' },
    { label: 'Medium', value: 'fa-brands fa-medium' },
    { label: 'DEV', value: 'fa-brands fa-dev' },
    { label: 'Dribbble', value: 'fa-brands fa-dribbble' },
    { label: 'Behance', value: 'fa-brands fa-behance' },
    { label: 'Vimeo', value: 'fa-brands fa-vimeo-v' },
    { label: 'WordPress', value: 'fa-brands fa-wordpress' },
    { label: 'Blogger', value: 'fa-brands fa-blogger-b' },
    { label: 'Yelp', value: 'fa-brands fa-yelp' },
    { label: 'Tripadvisor', value: 'fa-brands fa-tripadvisor' },
    { label: 'SoundCloud', value: 'fa-brands fa-soundcloud' },
    { label: 'Spotify', value: 'fa-brands fa-spotify' },
    { label: 'Apple', value: 'fa-brands fa-apple' },
    { label: 'Google', value: 'fa-brands fa-google' },
    { label: 'Microsoft', value: 'fa-brands fa-microsoft' },
    { label: 'Amazon', value: 'fa-brands fa-amazon' },
    { label: 'Paypal', value: 'fa-brands fa-paypal' }
]

const ALLOWED_SOCIAL_ICONS = new Set(SOCIAL_ICON_OPTIONS.map(i => i.value))

const normalizeIconClass = (icon = '') => {
    // Hỗ trợ dữ liệu cũ đang lưu theo FA5: "fab ..."
    return icon.replace(/^fab\s+/, 'fa-brands ').trim()
}

const isValidUrl = (value) => {
    if (!value) return false
    try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
        return false
    }
}

const clearErrors = () => {
    formErrors.name = ''
    formErrors.icon = ''
    formErrors.url = ''
    formErrors.description = ''
    formErrors.display_order = ''
}

const validateForm = () => {
    clearErrors()

    if (!formData.name.trim()) {
        formErrors.name = 'Tên liên kết là bắt buộc'
    }

    // if (!formData.icon.trim()) {
    //     formErrors.icon = 'Icon là bắt buộc'
    // }

    if (!formData.icon.trim()) {
        formErrors.icon = 'Icon là bắt buộc'
    } else if (!ALLOWED_SOCIAL_ICONS.has(formData.icon)) {
        formErrors.icon = 'Vui lòng chọn icon từ danh sách có sẵn'
    }

    if (!formData.url.trim()) {
        formErrors.url = 'URL là bắt buộc'
    } else if (!isValidUrl(formData.url)) {
        formErrors.url = 'URL không hợp lệ (cần bắt đầu bằng http/https)'
    }

    if (formData.display_order < 0) {
        formErrors.display_order = 'Thứ tự phải là số không âm'
    }

    return !Object.values(formErrors).some(Boolean)
}

const resetForm = () => {
    formData.name = ''
    formData.icon = ''
    formData.url = ''
    formData.description = ''
    formData.display_order = 0
    formData.is_active = true
    editingId.value = null
    showAddForm.value = false
    clearErrors()
}

const fetchSocialLinks = async () => {
    loading.value = true
    error.value = ''

    try {
        const response = await fetch(`${API_BASE}/settings/socials`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        socialLinks.value = (data?.data || []).sort((a, b) => a.display_order - b.display_order)
    } catch (err) {
        error.value = err.message || 'Không thể tải danh sách liên kết'
    } finally {
        loading.value = false
    }
}

const editLink = (link) => {
    formData.name = link.name
    // formData.icon = link.icon
    formData.icon = link.icon
    formData.url = link.url
    formData.description = link.description || ''
    formData.display_order = link.display_order
    formData.is_active = link.is_active
    editingId.value = link.id
    showAddForm.value = true
    clearErrors()
}

const saveLink = async () => {
    if (!validateForm()) {
        showError('Vui lòng kiểm tra lại thông tin')
        return
    }

    saving.value = true
    try {
        const payload = {
            name: formData.name.trim(),
            icon: formData.icon.trim(),
            url: formData.url.trim(),
            description: formData.description || '',
            display_order: formData.display_order,
            is_active: Boolean(formData.is_active)
        }

        const method = editingId.value ? 'PUT' : 'POST'
        const url = editingId.value
            ? `${API_BASE}/settings/socials/${editingId.value}`
            : `${API_BASE}/settings/socials`

        const response = await fetch(url, {
            method,
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data?.message || 'Không thể lưu liên kết')
        }

        showSuccess(data?.message || (editingId.value ? 'Đã cập nhật liên kết' : 'Đã tạo liên kết mới'))
        resetForm()
        await fetchSocialLinks()
    } catch (err) {
        showError(err.message || 'Không thể lưu liên kết')
    } finally {
        saving.value = false
    }
}

const deleteLink = (id, name) => {
    if (!canDelete.value) {
        showError('Ban khong co quyen xoa link.')
        return
    }
    linkToDelete.value = { id, name }
    showDeleteConfirm.value = true
}

const confirmDeleteLink = async () => {
    //if (!confirm('Bạn chắc chắn muốn xóa liên kết này?')) return
    if (!linkToDelete.value) return

    deletingId.value = linkToDelete.value.id
    try {
        const response = await fetch(`${API_BASE}/settings/socials/${linkToDelete.value.id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data?.message || 'Không thể xóa liên kết')
        }

        showSuccess(data?.message || 'Đã xóa liên kết')
        closeDeleteConfirm()
        await fetchSocialLinks()
    } catch (err) {
        showError(err.message || 'Không thể xóa liên kết')
    } finally {
        deletingId.value = null
    }
}

const closeDeleteConfirm = () => {
    showDeleteConfirm.value = false
    linkToDelete.value = null
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await fetchSocialLinks()
    }
})
</script>

<style scoped>
.socials-page {
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
    margin-bottom: 2rem;
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

.btn-success {
    background: #28a745;
    color: white;
}

.btn-success:hover:not(:disabled) {
    background: #218838;
}

.add-form-card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
    border-left: 4px solid #28a745;
}

.add-form-card h3 {
    color: #333;
    margin: 0 0 1.5rem 0;
    font-size: 1.2rem;
}

.form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
}

.form-control {
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

small {
    color: #999;
    font-size: 0.85rem;
    margin-top: 0.3rem;
}

.checkbox-group {
    flex-direction: row;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: #333;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    grid-column: 1 / -1;
    margin-top: 0.5rem;
}

.table-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.table {
    width: 100%;
    border-collapse: collapse;
}

.table thead {
    background: #f8f9fa;
    border-bottom: 2px solid #dee2e6;
}

.table th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
}

.table-row {
    border-bottom: 1px solid #dee2e6;
    transition: background-color 0.2s ease;
}

.table-row:hover {
    background: #f8f9fa;
}

.table td {
    padding: 1rem;
    font-size: 0.9rem;
}

.name-col {
    font-weight: 600;
    color: #333;
}

.icon-col {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: monospace;
    color: #666;
}

.icon-col i {
    font-size: 1.2rem;
    color: #1976d2;
}

.url-col a {
    color: #1976d2;
    text-decoration: none;
    word-break: break-all;
}

.url-col a:hover {
    text-decoration: underline;
}

.order-col {
    text-align: center;
    color: #666;
}

.status-col {
    text-align: center;
}

.badge {
    display: inline-block;
    padding: 0.35rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
}

.badge-success {
    background: #d4edda;
    color: #155724;
}

.badge-danger {
    background: #f8d7da;
    color: #721c24;
}

.action-col {
    text-align: center;
    display: flex;
    justify-content: center;
    gap: 0.5rem;
}

.btn-edit,
.btn-delete {
    padding: 0.5rem 0.75rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
}

.btn-edit {
    background: #e7f3ff;
    color: #1976d2;
}

.btn-edit:hover:not(:disabled) {
    background: #1976d2;
    color: white;
}

.btn-delete {
    background: #ffe7e7;
    color: #dc3545;
}

.btn-delete:hover:not(:disabled) {
    background: #dc3545;
    color: white;
}

.btn-edit:disabled,
.btn-delete:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.loading-state,
.error-state,
.empty-state {
    padding: 3rem 2rem;
    text-align: center;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-state i,
.empty-state i {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.loading-state i {
    color: #2196f3;
}

.empty-state i {
    color: #d4d4d4;
}

.error-state i {
    font-size: 2.5rem;
    color: #f59e0b;
    margin-bottom: 1rem;
}

.loading-state p,
.error-state p,
.empty-state p {
    color: #666;
    margin: 0 0 1rem 0;
}

.empty-state .hint {
    color: #999;
    font-size: 0.9rem;
}

.required {
    color: #dc3545;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1.5rem;
}

.modal {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 520px;
    overflow: hidden;
}

.modal-small {
    max-width: 460px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #eee;
}

.modal-header h3 {
    margin: 0;
    color: #333;
}

.btn-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #666;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
}

.btn-close:hover {
    background: #f0f0f0;
}

.modal-body {
    padding: 1.5rem;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.25rem 1.5rem;
    border-top: 1px solid #eee;
}

.delete-confirmation {
    text-align: center;
}

.warning-icon {
    font-size: 2.5rem;
    color: #f59e0b;
    margin-bottom: 0.75rem;
}

.warning-text {
    margin-top: 0.5rem;
    color: #dc3545;
    font-weight: 600;
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

.icon-preview {
    margin-top: 0.5rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #555;
    font-size: 0.9rem;
}

.icon-preview i {
    font-size: 1.2rem;
    color: #1976d2;
}

.icon-preview code {
    background: #f5f5f5;
    border-radius: 4px;
    padding: 0.15rem 0.4rem;
    font-size: 0.8rem;
}

.fa-zalo {
    display: inline-block;
    width: 1.15em;
    height: 1.15em;
    background-color: white;
    /* -webkit-mask: url('/assets/icons/zalo.svg') no-repeat center / contain;
    mask: url('/assets/icons/zalo.svg') no-repeat center / contain;
    vertical-align: -0.15em; */
    background-image: url('/assets/icons/zalo.svg');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;

}

@media (max-width: 1024px) {
    .page-header {
        flex-direction: column;
        gap: 1rem;
    }

    .form {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .header-content h1 {
        font-size: 1.5rem;
    }

    .add-form-card {
        padding: 1rem;
    }

    .table-container {
        font-size: 0.85rem;
    }

    .table th,
    .table td {
        padding: 0.75rem;
    }

    .icon-col {
        flex-direction: column;
        gap: 0.25rem;
    }

    .action-col {
        flex-direction: column;
        gap: 0.25rem;
    }

    @media (max-width: 480px) {
        .header-content h1 {
            font-size: 1.5rem;
        }

        .btn-sm {
            padding: 0.35rem 0.45rem;
        }

        .modal-overlay {
            padding: 1rem;
        }

        .modal-header,
        .modal-body,
        .modal-footer {
            padding: 1rem;
        }
    }
}
</style>