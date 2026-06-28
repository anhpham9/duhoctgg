<template>
    <div class="about-reasons-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Không thể truy cập Quản lý Lý do chọn</h3>
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
                        <i class="fas fa-heart"></i>
                        Quản lý Lý do chọn
                    </h1>
                    <p>Cập nhật danh sách 6 lý do tại sao khách hàng nên chọn Du Học NB</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" :disabled="loading" @click="fetchReasons">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                        Làm mới
                    </button>
                    <button class="btn btn-primary" :disabled="!hasAnyChanges" @click="showAddForm">
                        <i class="fas fa-plus"></i>
                        Thêm lý do
                    </button>
                </div>
            </div>

            <div v-if="loading" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải dữ liệu...</p>
            </div>

            <div v-else class="content-wrapper">
                <!-- Add/Edit Form -->
                <div v-if="showForm" class="form-section">
                    <div class="form-header">
                        <h3>
                            <i class="fas" :class="editingId ? 'fa-edit' : 'fa-plus'"></i>
                            {{ editingId ? 'Cập nhật lý do chọn' : 'Thêm lý do chọn mới' }}
                        </h3>
                        <button class="btn-close" type="button" @click="closeForm">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <form @submit.prevent="saveItem" class="item-form">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Icon Font Awesome 
                                    <span class="required">*</span>
                                    <span v-if="formData.icon" class="icon-preview-chip" :title="formData.icon">
                                        <i :class="formData.icon"></i>
                                        <span>{{ formData.icon }}</span>
                                    </span>
                                </label>
                                <input
                                    v-model.trim="formData.icon"
                                    type="text"
                                    class="form-control"
                                    :class="{ 'is-invalid': !!formErrors.icon }"
                                    placeholder="Ví dụ: fas fa-certificate"
                                >
                                <p v-if="formErrors.icon" class="field-error">{{ formErrors.icon }}</p>
                                <small class="field-hint">Sử dụng Font Awesome class (ví dụ: fas fa-certificate, fas fa-user-tie)</small>
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

                            <div class="form-group full">
                                <label>Tiêu đề <span class="required">*</span></label>
                                <input
                                    v-model.trim="formData.title"
                                    @input="clearError('title')"
                                    type="text"
                                    class="form-control"
                                    :class="{ 'is-invalid': !!formErrors.title }"
                                    placeholder="Ví dụ: Được Chứng Nhận"
                                    maxlength="255"
                                >
                                <p v-if="formErrors.title" class="field-error">{{ formErrors.title }}</p>
                                <small class="field-hint">{{ formData.title.length }}/255 ký tự</small>
                            </div>

                            <div class="form-group full">
                                <label>Mô tả <span class="required">*</span></label>
                                <textarea
                                    v-model.trim="formData.description"
                                    @input="clearError('description')"
                                    class="form-control"
                                    :class="{ 'is-invalid': !!formErrors.description }"
                                    rows="4"
                                    placeholder="Ví dụ: Được cấp phép hoạt động hợp pháp bởi các cơ quan chức năng..."
                                ></textarea>
                                <p v-if="formErrors.description" class="field-error">{{ formErrors.description }}</p>
                                <small class="field-hint">{{ formData.description.length }} ký tự</small>
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

                <!-- Items List -->
                <div class="reasons-list">
                    <div v-if="reasons.length === 0" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>Chưa có lý do nào. Thêm lý do đầu tiên để bắt đầu.</p>
                    </div>

                    <div v-else class="reasons-cards">
                        <div v-for="reason in reasons" :key="reason.id" class="reason-card" :class="{ 'is-inactive': !reason.is_active }">
                            <div class="reason-header">
                                <div class="reason-icon-display">
                                    <i v-if="reason.icon" :class="reason.icon"></i>
                                    <i v-else class="fas fa-question-circle text-muted"></i>
                                </div>
                                <div class="reason-actions">
                                    <button class="btn-icon" type="button" @click="editItem(reason)" title="Chỉnh sửa">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon btn-danger" type="button" @click="deleteItem(reason.id)" title="Xóa">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>

                            <h3 class="reason-title">{{ reason.title }}</h3>
                            <p class="reason-description">{{ reason.description }}</p>

                            <div class="reason-meta">
                                <span v-if="!reason.is_active" class="badge badge-inactive">Ẩn</span>
                                <span class="text-muted text-small">Thứ tự: {{ reason.sort_order }}</span>
                            </div>
                        </div>
                    </div>
                </div>
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

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'permission'],
    ssr: false
})

useHead({
    title: 'Quản lý Lý do chọn - Admin'
})

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2, 3]))

const reasons = ref([])
const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)
const editingId = ref(null)

const formData = reactive({
    icon: '',
    title: '',
    description: '',
    sortOrder: 0,
    isActive: true
})

const formErrors = reactive({
    icon: '',
    title: '',
    description: ''
})

const snapshot = ref(null)

const hasAnyChanges = computed(() => {
    if (!snapshot.value) return false
    return JSON.stringify(reasons.value) !== JSON.stringify(snapshot.value)
})

const clearError = (field) => {
    if (formErrors[field]) formErrors[field] = ''
}

const validateForm = () => {
    formErrors.icon = ''
    formErrors.title = ''
    formErrors.description = ''

    if (!formData.title.trim()) {
        formErrors.title = 'Tiêu đề là bắt buộc'
    }

    if (!formData.description.trim()) {
        formErrors.description = 'Mô tả là bắt buộc'
    } else if (formData.description.trim().length < 10) {
        formErrors.description = 'Mô tả phải có ít nhất 10 ký tự'
    }

    return !Object.values(formErrors).some(Boolean)
}

const resetForm = () => {
    formData.icon = ''
    formData.title = ''
    formData.description = ''
    formData.sortOrder = 0
    formData.isActive = true
    editingId.value = null
    clearError('icon')
    clearError('title')
    clearError('description')
}

const closeForm = () => {
    showForm.value = false
    resetForm()
}

const showAddForm = () => {
    resetForm()
    showForm.value = true
}

const editItem = (reason) => {
    editingId.value = reason.id
    formData.icon = reason.icon || ''
    formData.title = reason.title
    formData.description = reason.description
    formData.sortOrder = reason.sort_order || 0
    formData.isActive = reason.is_active !== false
    showForm.value = true
}

const fetchReasons = async () => {
    loading.value = true
    try {
        const response = await fetch(`${API_BASE}/about/reasons/admin`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        reasons.value = data?.data || []
        snapshot.value = JSON.stringify(reasons.value)
    } catch (error) {
        showError(error.message || 'Không thể tải danh sách lý do')
    } finally {
        loading.value = false
    }
}

const saveItem = async () => {
    if (!validateForm()) {
        showError('Vui lòng kiểm tra lại thông tin')
        return
    }

    saving.value = true
    try {
        const payload = {
            icon: formData.icon.trim(),
            title: formData.title.trim(),
            description: formData.description.trim(),
            sortOrder: Number(formData.sortOrder),
            isActive: formData.isActive
        }

        const url = editingId.value
            ? `${API_BASE}/about/reasons/${editingId.value}`
            : `${API_BASE}/about/reasons`
        
        const method = editingId.value ? 'PUT' : 'POST'

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

        await fetchReasons()
        closeForm()
        showSuccess(data?.message || (editingId.value ? 'Cập nhật thành công' : 'Tạo thành công'))
    } catch (error) {
        showError(error.message || 'Không thể lưu lý do chọn')
    } finally {
        saving.value = false
    }
}

const deleteItem = async (id) => {
    if (!confirm('Xác nhận xóa lý do chọn này?')) return

    try {
        const response = await fetch(`${API_BASE}/about/reasons/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        await fetchReasons()
        showSuccess('Xóa thành công')
    } catch (error) {
        showError(error.message || 'Không thể xóa lý do chọn')
    }
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await fetchReasons()
    }
})
</script>

<style scoped>
.about-reasons-page {
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
    line-height: 1.5;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 1.5rem 0;
    border-bottom: 2px solid #eee;
}

.header-content h1 {
    color: #333;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 2rem;
}

.header-content h1 i {
    color: #1976d2;
}

.header-content p {
    margin: 0;
    color: #666;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
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

.content-wrapper {
    display: grid;
    gap: 1.5rem;
}

.form-section {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.form-header {
    padding: 1.25rem;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.form-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 10px;
}

.btn-close {
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    font-size: 1.3rem;
    padding: 0;
}

.btn-close:hover {
    color: #333;
}

.item-form {
    padding: 1.25rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
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

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.reasons-list {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    padding: 1.5rem;
}

.empty-state {
    text-align: center;
    padding: 2rem;
    color: #999;
}

.empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.reasons-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.reason-card {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 10px;
    padding: 1.5rem;
    transition: all 0.2s ease;
    position: relative;
}

.reason-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #1976d2;
}

.reason-card.is-inactive {
    opacity: 0.7;
    background: #f8f9fa;
}

.reason-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.reason-icon-display {
    font-size: 2rem;
    color: #1976d2;
}

.reason-icon-display .text-muted {
    color: #ccc;
}

.reason-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-icon {
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    padding: 0.5rem;
    border-radius: 4px;
    transition: all 0.2s;
}

.btn-icon:hover {
    background: #f0f0f0;
    color: #333;
}

.btn-icon.btn-danger:hover {
    background: #ffebee;
    color: #dc3545;
}

.reason-title {
    margin: 0 0 0.75rem;
    font-size: 1.1rem;
    color: #333;
    font-weight: 600;
}

.reason-description {
    margin: 0 0 1rem;
    color: #666;
    font-size: 0.95rem;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.reason-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.85rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
}

.badge {
    padding: 0.25rem 0.6rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
}

.badge-inactive {
    background: #fff3cd;
    color: #856404;
}

.text-muted {
    color: #999;
}

.text-small {
    font-size: 0.85rem;
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

.icon-preview-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-left: 0.45rem;
    padding: 0.15rem 0.45rem;
    border-radius: 999px;
    background: #eef5ff;
    color: #204a78;
    font-size: 0.78rem;
    font-weight: 600;
}

.icon-preview-chip i {
    font-size: 0.85rem;
}

@media (max-width: 992px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .header-actions {
        width: 100%;
        justify-content: flex-start;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .reasons-cards {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
}

@media (max-width: 640px) {
    .header-content h1 {
        font-size: 1.45rem;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }

    .reasons-cards {
        grid-template-columns: 1fr;
    }
}
</style>
