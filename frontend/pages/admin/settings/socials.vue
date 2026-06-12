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
                        <input
                            v-model.trim="formData.name"
                            type="text"
                            class="form-control"
                            :class="{ 'is-invalid': !!formErrors.name }"
                            placeholder="ví dụ: Facebook"
                            maxlength="100"
                        >
                        <p v-if="formErrors.name" class="field-error">{{ formErrors.name }}</p>
                    </div>

                    <div class="form-group">
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
                    </div>

                    <div class="form-group">
                        <label>URL <span class="required">*</span></label>
                        <input
                            v-model.trim="formData.url"
                            type="url"
                            class="form-control"
                            :class="{ 'is-invalid': !!formErrors.url }"
                            placeholder="https://facebook.com/yourpage"
                        >
                        <p v-if="formErrors.url" class="field-error">{{ formErrors.url }}</p>
                    </div>

                    <div class="form-group">
                        <label>Mô tả</label>
                        <textarea
                            v-model="formData.description"
                            class="form-control"
                            rows="2"
                            placeholder="Mô tả ngắn về liên kết này"
                            maxlength="500"
                        ></textarea>
                    </div>

                    <div class="form-group">
                        <label>Thứ tự hiển thị <span class="required">*</span></label>
                        <input
                            v-model.number="formData.displayOrder"
                            type="number"
                            class="form-control"
                            :class="{ 'is-invalid': !!formErrors.displayOrder }"
                            min="0"
                        >
                        <p v-if="formErrors.displayOrder" class="field-error">{{ formErrors.displayOrder }}</p>
                    </div>

                    <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                            <input v-model="formData.isActive" type="checkbox">
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
                            <td class="order-col">{{ link.displayOrder }}</td>
                            <td class="status-col">
                                <span :class="['badge', link.isActive ? 'badge-success' : 'badge-danger']">
                                    {{ link.isActive ? 'Kích hoạt' : 'Vô hiệu' }}
                                </span>
                            </td>
                            <td class="action-col">
                                <button
                                    class="btn-edit"
                                    :disabled="saving"
                                    @click="editLink(link)"
                                    title="Chỉnh sửa"
                                >
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button
                                    class="btn-delete"
                                    :disabled="saving || deleting === link.id"
                                    @click="deleteLink(link.id)"
                                    title="Xóa"
                                >
                                    <i :class="deleting === link.id ? 'fas fa-spinner fa-spin' : 'fas fa-trash'"></i>
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

const loading = ref(false)
const saving = ref(false)
const deleting = ref(null)
const error = ref('')
const showAddForm = ref(false)
const editingId = ref(null)
const socialLinks = ref([])

const formData = reactive({
    name: '',
    icon: '',
    url: '',
    description: '',
    displayOrder: 0,
    isActive: true
})

const formErrors = reactive({
    name: '',
    icon: '',
    url: '',
    description: '',
    displayOrder: ''
})

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
    formErrors.displayOrder = ''
}

const validateForm = () => {
    clearErrors()

    if (!formData.name.trim()) {
        formErrors.name = 'Tên liên kết là bắt buộc'
    }

    if (!formData.icon.trim()) {
        formErrors.icon = 'Icon là bắt buộc'
    }

    if (!formData.url.trim()) {
        formErrors.url = 'URL là bắt buộc'
    } else if (!isValidUrl(formData.url)) {
        formErrors.url = 'URL không hợp lệ (cần bắt đầu bằng http/https)'
    }

    if (formData.displayOrder < 0) {
        formErrors.displayOrder = 'Thứ tự phải là số không âm'
    }

    return !Object.values(formErrors).some(Boolean)
}

const resetForm = () => {
    formData.name = ''
    formData.icon = ''
    formData.url = ''
    formData.description = ''
    formData.displayOrder = 0
    formData.isActive = true
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

        socialLinks.value = (data?.data || []).sort((a, b) => a.displayOrder - b.displayOrder)
    } catch (err) {
        error.value = err.message || 'Không thể tải danh sách liên kết'
    } finally {
        loading.value = false
    }
}

const editLink = (link) => {
    formData.name = link.name
    formData.icon = link.icon
    formData.url = link.url
    formData.description = link.description || ''
    formData.displayOrder = link.displayOrder
    formData.isActive = link.isActive
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
            displayOrder: formData.displayOrder,
            isActive: Boolean(formData.isActive)
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

const deleteLink = async (id) => {
    if (!confirm('Bạn chắc chắn muốn xóa liên kết này?')) return

    deleting.value = id
    try {
        const response = await fetch(`${API_BASE}/settings/socials/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data?.message || 'Không thể xóa liên kết')
        }

        showSuccess(data?.message || 'Đã xóa liên kết')
        await fetchSocialLinks()
    } catch (err) {
        showError(err.message || 'Không thể xóa liên kết')
    } finally {
        deleting.value = null
    }
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
}
</style>
                    <input
                        v-model.trim="settings.zaloUrl"
                        @input="clearFieldError('zaloUrl')"
                        type="url"
                        class="form-control"
                        :class="{ 'is-invalid': !!formErrors.zaloUrl }"
                        placeholder="https://zalo.me/..."
                    >
                    <p v-if="formErrors.zaloUrl" class="field-error">{{ formErrors.zaloUrl }}</p>
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
    siteDescription: '',
    contactEmail: '',
    phone: '',
    hotline: '',
    facebookUrl: '',
    zaloUrl: '',
    address: '',
    seoDefaultTitle: '',
    seoDefaultDescription: '',
    maintenanceMode: false
})

const formErrors = reactive({
    siteName: '',
    siteLogoUrl: '',
    siteDescription: '',
    contactEmail: '',
    phone: '',
    hotline: '',
    facebookUrl: '',
    zaloUrl: '',
    address: '',
    seoDefaultTitle: '',
    seoDefaultDescription: '',
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
    settings.siteDescription = data.siteDescription || ''
    settings.contactEmail = data.contactEmail || ''
    settings.phone = data.phone || ''
    settings.hotline = data.hotline || ''
    settings.facebookUrl = data.facebookUrl || ''
    settings.zaloUrl = data.zaloUrl || ''
    settings.address = data.address || ''
    settings.seoDefaultTitle = data.seoDefaultTitle || ''
    settings.seoDefaultDescription = data.seoDefaultDescription || ''
    settings.maintenanceMode = Boolean(data.maintenanceMode)
}

const clearAllErrors = () => {
    formErrors.siteName = ''
    formErrors.siteLogoUrl = ''
    formErrors.siteDescription = ''
    formErrors.contactEmail = ''
    formErrors.phone = ''
    formErrors.hotline = ''
    formErrors.facebookUrl = ''
    formErrors.zaloUrl = ''
    formErrors.address = ''
    formErrors.seoDefaultTitle = ''
    formErrors.seoDefaultDescription = ''
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

    if (settings.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contactEmail)) {
        formErrors.contactEmail = 'Email không hợp lệ'
    }

    if (settings.phone && !/^[0-9+()\-\s]{8,20}$/.test(settings.phone)) {
        formErrors.phone = 'Số điện thoại không hợp lệ'
    }

    if (settings.hotline && !/^[0-9+()\-\s]{8,20}$/.test(settings.hotline)) {
        formErrors.hotline = 'Hotline không hợp lệ'
    }

    if (settings.facebookUrl && !isValidUrl(settings.facebookUrl)) {
        formErrors.facebookUrl = 'Facebook URL không hợp lệ (cần bắt đầu bằng http/https)'
    }

    if (settings.zaloUrl && !isValidUrl(settings.zaloUrl)) {
        formErrors.zaloUrl = 'Zalo URL không hợp lệ (cần bắt đầu bằng http/https)'
    }

    if (settings.address.length > 1000) {
        formErrors.address = 'Địa chỉ tối đa 1000 ký tự'
    }

    if (settings.seoDefaultTitle.length > 255) {
        formErrors.seoDefaultTitle = 'SEO Title tối đa 255 ký tự'
    }

    if (settings.seoDefaultDescription.length > 2000) {
        formErrors.seoDefaultDescription = 'SEO Description tối đa 2000 ký tự'
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
            siteDescription: settings.siteDescription || '',
            contactEmail: settings.contactEmail.trim(),
            phone: settings.phone.trim(),
            hotline: settings.hotline.trim(),
            facebookUrl: settings.facebookUrl.trim(),
            zaloUrl: settings.zaloUrl.trim(),
            address: settings.address || '',
            seoDefaultTitle: settings.seoDefaultTitle || '',
            seoDefaultDescription: settings.seoDefaultDescription || '',
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
                formErrors.contactEmail = data.errors.contactEmail || ''
                formErrors.phone = data.errors.phone || ''
                formErrors.hotline = data.errors.hotline || ''
                formErrors.facebookUrl = data.errors.facebookUrl || ''
                formErrors.zaloUrl = data.errors.zaloUrl || ''
                formErrors.seoDefaultTitle = data.errors.seoDefaultTitle || ''
                formErrors.seoDefaultDescription = data.errors.seoDefaultDescription || ''
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
        siteDescription: '',
        contactEmail: '',
        phone: '',
        hotline: '',
        facebookUrl: '',
        zaloUrl: '',
        address: '',
        seoDefaultTitle: '',
        seoDefaultDescription: '',
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
