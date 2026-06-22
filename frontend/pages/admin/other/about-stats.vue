<template>
    <div class="about-stats-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Không thể truy cập Quản lý Thành tích</h3>
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
                        <i class="fas fa-chart-bar"></i>
                        Quản lý Thành tích
                    </h1>
                    <p>Cập nhật các con số ấn tượng của công ty (số học sinh, trường đối tác, tỷ lệ visa, năm kinh nghiệm)</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" :disabled="loading" @click="fetchStats">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                        Làm mới
                    </button>
                    <button class="btn btn-primary" :disabled="!hasAnyChanges" @click="showAddForm">
                        <i class="fas fa-plus"></i>
                        Thêm thành tích
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
                            {{ editingId ? 'Cập nhật thành tích' : 'Thêm thành tích mới' }}
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
                                    placeholder="Ví dụ: fas fa-users"
                                >
                                <p v-if="formErrors.icon" class="field-error">{{ formErrors.icon }}</p>
                                <small class="field-hint">Sử dụng Font Awesome class (ví dụ: fas fa-users, fas fa-handshake)</small>
                            </div>

                            <div class="form-group">
                                <label>Số <span class="required">*</span></label>
                                <input
                                    v-model.number="formData.number"
                                    @input="clearError('number')"
                                    type="number"
                                    class="form-control"
                                    :class="{ 'is-invalid': !!formErrors.number }"
                                    placeholder="Ví dụ: 2500"
                                >
                                <p v-if="formErrors.number" class="field-error">{{ formErrors.number }}</p>
                            </div>

                            <div class="form-group full">
                                <label>Label <span class="required">*</span></label>
                                <input
                                    v-model.trim="formData.label"
                                    @input="clearError('label')"
                                    type="text"
                                    class="form-control"
                                    :class="{ 'is-invalid': !!formErrors.label }"
                                    placeholder="Ví dụ: Học sinh thành công"
                                >
                                <p v-if="formErrors.label" class="field-error">{{ formErrors.label }}</p>
                            </div>

                            <div class="form-group">
                                <label>Thứ tự sắp xếp</label>
                                <input
                                    v-model.number="formData.sortOrder"
                                    type="number"
                                    class="form-control"
                                    placeholder="0"
                                >
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
                <div class="stats-list">
                    <div v-if="stats.length === 0" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>Chưa có thành tích nào. Thêm thành tích đầu tiên để bắt đầu.</p>
                    </div>

                    <div v-else class="about-stats-grid">
                        <div v-for="stat in stats" :key="stat.id" class="about-stat-card" :class="{ 'is-inactive': !stat.is_active }">
                            <div class="stat-header">
                                <div class="stat-icon-display">
                                    <i v-if="stat.icon" :class="stat.icon"></i>
                                    <i v-else class="fas fa-question-circle text-muted"></i>
                                </div>
                                <div class="stat-actions">
                                    <button class="btn-icon" type="button" @click="editItem(stat)" title="Chỉnh sửa">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon btn-danger" type="button" @click="deleteItem(stat.id)" title="Xóa">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="stat-number">{{ stat.number }}</div>
                            <div class="stat-label">{{ stat.label }}</div>

                            <div class="stat-meta">
                                <span v-if="!stat.is_active" class="badge badge-inactive">Ẩn</span>
                                <span class="text-muted text-small">Thứ tự: {{ stat.sort_order }}</span>
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
    title: 'Quản lý Thành tích - Admin'
})

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2, 3]))

const stats = ref([])
const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)
const editingId = ref(null)

const formData = reactive({
    icon: '',
    number: '',
    label: '',
    sortOrder: 0,
    isActive: true
})

const formErrors = reactive({
    icon: '',
    number: '',
    label: ''
})

const snapshot = ref(null)

const hasAnyChanges = computed(() => {
    if (!snapshot.value) return false
    return JSON.stringify(stats.value) !== JSON.stringify(snapshot.value)
})

const clearError = (field) => {
    if (formErrors[field]) formErrors[field] = ''
}

const validateForm = () => {
    formErrors.icon = ''
    formErrors.number = ''
    formErrors.label = ''

    if (!formData.label.trim()) {
        formErrors.label = 'Label là bắt buộc'
    }

    if (formData.number === '' || formData.number === null) {
        formErrors.number = 'Số là bắt buộc'
    } else if (Number(formData.number) < 0) {
        formErrors.number = 'Số phải lớn hơn hoặc bằng 0'
    }

    return !Object.values(formErrors).some(Boolean)
}

const resetForm = () => {
    formData.icon = ''
    formData.number = ''
    formData.label = ''
    formData.sortOrder = 0
    formData.isActive = true
    editingId.value = null
    clearError('icon')
    clearError('number')
    clearError('label')
}

const closeForm = () => {
    showForm.value = false
    resetForm()
}

const showAddForm = () => {
    resetForm()
    showForm.value = true
}

const editItem = (stat) => {
    editingId.value = stat.id
    formData.icon = stat.icon || ''
    formData.number = stat.number
    formData.label = stat.label
    formData.sortOrder = stat.sort_order || 0
    formData.isActive = stat.is_active !== false
    showForm.value = true
}

const fetchStats = async () => {
    loading.value = true
    try {
        const response = await fetch(`${API_BASE}/about/stats/admin`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        stats.value = data?.data || []
        snapshot.value = JSON.stringify(stats.value)
    } catch (error) {
        showError(error.message || 'Không thể tải danh sách thành tích')
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
            number: Number(formData.number),
            label: formData.label.trim(),
            sortOrder: Number(formData.sortOrder),
            isActive: formData.isActive
        }

        const url = editingId.value
            ? `${API_BASE}/about/stats/${editingId.value}`
            : `${API_BASE}/about/stats`
        
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

        await fetchStats()
        closeForm()
        showSuccess(data?.message || (editingId.value ? 'Cập nhật thành công' : 'Tạo thành công'))
    } catch (error) {
        showError(error.message || 'Không thể lưu thành tích')
    } finally {
        saving.value = false
    }
}

const deleteItem = async (id) => {
    if (!confirm('Xác nhận xóa thành tích này?')) return

    try {
        const response = await fetch(`${API_BASE}/about/stats/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        await fetchStats()
        showSuccess('Xóa thành công')
    } catch (error) {
        showError(error.message || 'Không thể xóa thành tích')
    }
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await fetchStats()
    }
})
</script>

<style scoped>
.about-stats-page {
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

.stats-list {
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

.about-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}

.about-stat-card {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 10px;
    padding: 1.5rem;
    transition: all 0.2s ease;
    position: relative;
}

.about-stat-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #1976d2;
}

.about-stat-card.is-inactive {
    opacity: 0.7;
    background: #f8f9fa;
}

.stat-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.stat-icon-display {
    font-size: 2rem;
    color: #1976d2;
}

.stat-icon-display .text-muted {
    color: #ccc;
}

.stat-actions {
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

.stat-number {
    font-size: 2rem;
    font-weight: bold;
    color: #1976d2;
    margin-bottom: 0.5rem;
}

.stat-label {
    color: #333;
    font-weight: 500;
    margin-bottom: 1rem;
}

.stat-meta {
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

    .about-stats-grid {
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

    .about-stats-grid {
        grid-template-columns: 1fr;
    }
}
</style>
