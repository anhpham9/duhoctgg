<template>
    <div class="about-missions-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Không thể truy cập Quản lý Tầm nhìn</h3>
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
                        <i class="fas fa-eye"></i>
                        Quản lý Tầm nhìn / Sứ mệnh
                    </h1>
                    <p>Cập nhật các card tầm nhìn, sứ mệnh, giá trị cốt lõi của Du Học NB</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" :disabled="loading" @click="fetchMissions">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                        Làm m
                        ới
                    </button>
                    <button class="btn btn-primary" @click="showAddForm">
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
                <!-- Form thêm/sửa -->
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

                    <form @submit.prevent="saveItem" class="item-form">
                        <div class="form-grid">

                            <!-- Icon -->
                            <div class="form-group">
                                <label>
                                    Icon Font Awesome
                                    <span v-if="formData.icon" class="icon-preview-chip" :title="formData.icon">
                                        <i :class="formData.icon"></i>
                                        <span>{{ formData.icon }}</span>
                                    </span>
                                </label>
                                <input v-model.trim="formData.icon" type="text" class="form-control" placeholder="Ví dụ: fas fa-eye">
                                <small class="field-hint">Font Awesome class. Xem tại fontawesome.com</small>
                            </div>

                            <!-- Sort order -->
                            <div class="form-group">
                                <label>Thứ tự sắp xếp</label>
                                <input v-model.number="formData.sortOrder" type="number" class="form-control" placeholder="0">
                            </div>

                            <!-- Title -->
                            <div class="form-group full">
                                <label>Tiêu đề <span class="required">*</span></label>
                                <input
                                    v-model.trim="formData.title"
                                    @input="clearError('title')"
                                    type="text"
                                    class="form-control"
                                    :class="{ 'is-invalid': !!formErrors.title }"
                                    placeholder="Ví dụ: TẦM NHÌN"
                                    maxlength="255"
                                >
                                <p v-if="formErrors.title" class="field-error">{{ formErrors.title }}</p>
                            </div>

                            <!-- Type selector -->
                            <div class="form-group full">
                                <label>Loại nội dung <span class="required">*</span></label>
                                <div class="type-switch">
                                    <button type="button" class="type-btn" :class="{ active: formData.type === 'paragraph' }" @click="setType('paragraph')">
                                        <i class="fas fa-align-left"></i>
                                        Đoạn văn
                                    </button>
                                    <button type="button" class="type-btn" :class="{ active: formData.type === 'list' }" @click="setType('list')">
                                        <i class="fas fa-list"></i>
                                        Danh sách (key : value)
                                    </button>
                                </div>
                                <p v-if="formErrors.type" class="field-error">{{ formErrors.type }}</p>
                            </div>

                            <!-- Paragraph -->
                            <div v-if="formData.type === 'paragraph'" class="form-group full">
                                <label>Nội dung <span class="required">*</span></label>
                                <textarea
                                    v-model.trim="formData.description"
                                    @input="clearError('description')"
                                    class="form-control"
                                    :class="{ 'is-invalid': !!formErrors.description }"
                                    rows="5"
                                    placeholder="Nhập đoạn văn mô tả..."
                                ></textarea>
                                <p v-if="formErrors.description" class="field-error">{{ formErrors.description }}</p>
                                <small class="field-hint">{{ formData.description.length }} ký tự</small>
                            </div>

                            <!-- List key:value -->
                            <div v-if="formData.type === 'list'" class="form-group full">
                                <label>Danh sách <span class="required">*</span></label>
                                <p v-if="formErrors.description" class="field-error">{{ formErrors.description }}</p>
                                <div class="list-editor">
                                    <div v-for="(item, index) in listItems" :key="index" class="list-row">
                                        <input v-model.trim="item.key" type="text" class="form-control list-key" placeholder="Khóa (vd: Uy tín)">
                                        <span class="list-sep">:</span>
                                        <input v-model.trim="item.value" type="text" class="form-control list-value" placeholder="Giá trị (vd: Minh bạch trong mọi giao dịch)">
                                        <button type="button" class="btn-icon btn-danger" :disabled="listItems.length <= 1" @click="removeListItem(index)" title="Xóa dòng">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                    <button type="button" class="btn-add-row" @click="addListItem">
                                        <i class="fas fa-plus"></i>
                                        Thêm dòng
                                    </button>
                                </div>
                                <small class="field-hint">Mỗi dòng là 1 cặp <strong>Khóa : Giá trị</strong></small>
                            </div>

                            <!-- Status -->
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

                <!-- Danh sách -->
                <div class="missions-list">
                    <div v-if="missions.length === 0" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>Chưa có mục nào. Thêm mục đầu tiên để bắt đầu.</p>
                    </div>

                    <div v-else class="missions-cards">
                        <div
                            v-for="mission in missions"
                            :key="mission.id"
                            class="mission-card"
                            :class="{ 'is-inactive': !mission.is_active }"
                        >
                            <div class="mission-header">
                                <div class="mission-icon-display">
                                    <i v-if="mission.icon" :class="mission.icon"></i>
                                    <i v-else class="fas fa-question-circle text-muted"></i>
                                </div>
                                <div class="mission-actions">
                                    <button class="btn-icon" type="button" @click="editItem(mission)" title="Chỉnh sửa">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon btn-danger" type="button" @click="deleteItem(mission.id)" title="Xóa">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>

                            <h3 class="mission-title">{{ mission.title }}</h3>

                            <!-- Paragraph preview -->
                            <p v-if="mission.type === 'paragraph'" class="mission-description">
                                {{ mission.description }}
                            </p>

                            <!-- List preview -->
                            <ul v-else class="mission-list-preview">
                                <li v-for="(item, i) in parseList(mission.description)" :key="i">
                                    <strong>{{ item.key }}</strong>: {{ item.value }}
                                </li>
                            </ul>

                            <div class="mission-meta">
                                <span class="badge" :class="mission.type === 'list' ? 'badge-list' : 'badge-paragraph'">
                                    {{ mission.type === 'list' ? 'Danh sách' : 'Đoạn văn' }}
                                </span>
                                <span v-if="!mission.is_active" class="badge badge-inactive">Ẩn</span>
                                <span class="text-muted text-small">Thứ tự: {{ mission.sort_order }}</span>
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

useHead({ title: 'Quản lý Tầm nhìn / Sứ mệnh - Admin' })

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2, 3]))

const missions = ref([])
const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)
const editingId = ref(null)

// ===== List items =====
const listItems = ref([{ key: '', value: '' }])
const addListItem = () => listItems.value.push({ key: '', value: '' })
const removeListItem = (index) => {
    if (listItems.value.length > 1) listItems.value.splice(index, 1)
}

// ===== Form =====
const formData = reactive({
    icon: '',
    title: '',
    type: 'paragraph',
    description: '',
    sortOrder: 0,
    isActive: true
})

const formErrors = reactive({ title: '', type: '', description: '' })

const setType = (type) => {
    formData.type = type
    formErrors.description = ''
    if (type === 'list' && listItems.value.length === 0) {
        listItems.value = [{ key: '', value: '' }]
    }
}

const clearError = (field) => { if (formErrors[field]) formErrors[field] = '' }

// ===== Parse list =====
const parseList = (raw) => {
    try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        return Array.isArray(parsed) ? parsed : []
    } catch { return [] }
}

// ===== Validation =====
const validateForm = () => {
    formErrors.title = ''
    formErrors.type = ''
    formErrors.description = ''

    if (!formData.title.trim()) formErrors.title = 'Tiêu đề là bắt buộc'
    if (!formData.type) formErrors.type = 'Loại nội dung là bắt buộc'

    if (formData.type === 'paragraph') {
        if (!formData.description.trim()) {
            formErrors.description = 'Nội dung là bắt buộc'
        } else if (formData.description.trim().length < 10) {
            formErrors.description = 'Nội dung phải có ít nhất 10 ký tự'
        }
    } else if (formData.type === 'list') {
        const valid = listItems.value.filter(i => i.key.trim() || i.value.trim())
        if (valid.length === 0) {
            formErrors.description = 'Phải có ít nhất 1 dòng key:value'
        } else if (valid.some(i => !i.key.trim() || !i.value.trim())) {
            formErrors.description = 'Mỗi dòng phải có cả Khóa và Giá trị'
        }
    }

    return !Object.values(formErrors).some(Boolean)
}

// ===== Reset / Open =====
const resetForm = () => {
    formData.icon = ''
    formData.title = ''
    formData.type = 'paragraph'
    formData.description = ''
    formData.sortOrder = 0
    formData.isActive = true
    listItems.value = [{ key: '', value: '' }]
    editingId.value = null
    formErrors.title = ''
    formErrors.type = ''
    formErrors.description = ''
}

const closeForm = () => { showForm.value = false; resetForm() }
const showAddForm = () => { resetForm(); showForm.value = true }

const editItem = (mission) => {
    editingId.value = mission.id
    formData.icon = mission.icon || ''
    formData.title = mission.title
    formData.type = mission.type || 'paragraph'
    formData.sortOrder = mission.sort_order ?? 0
    formData.isActive = mission.is_active !== false

    if (mission.type === 'list') {
        const parsed = parseList(mission.description)
        listItems.value = parsed.length > 0
            ? parsed.map(i => ({ key: i.key || '', value: i.value || '' }))
            : [{ key: '', value: '' }]
        formData.description = ''
    } else {
        formData.description = mission.description || ''
        listItems.value = [{ key: '', value: '' }]
    }
    showForm.value = true
}

// ===== Fetch =====
const fetchMissions = async () => {
    loading.value = true
    try {
        const response = await fetch(`${API_BASE}/about/missions/admin`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`)
        missions.value = data?.data || []
    } catch (error) {
        showError(error.message || 'Không thể tải danh sách tầm nhìn')
    } finally {
        loading.value = false
    }
}

// ===== Save =====
const saveItem = async () => {
    if (!validateForm()) { showError('Vui lòng kiểm tra lại thông tin'); return }
    saving.value = true
    try {
        let description
        if (formData.type === 'list') {
            description = JSON.stringify(
                listItems.value
                    .filter(i => i.key.trim() || i.value.trim())
                    .map(i => ({ key: i.key.trim(), value: i.value.trim() }))
            )
        } else {
            description = formData.description.trim()
        }

        const payload = {
            icon: formData.icon.trim(),
            title: formData.title.trim(),
            type: formData.type,
            description,
            sortOrder: Number(formData.sortOrder),
            isActive: formData.isActive
        }

        const url = editingId.value
            ? `${API_BASE}/about/missions/${editingId.value}`
            : `${API_BASE}/about/missions`
        const method = editingId.value ? 'PUT' : 'POST'

        const response = await fetch(url, {
            method,
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`)

        await fetchMissions()
        closeForm()
        showSuccess(data?.message || (editingId.value ? 'Cập nhật thành công' : 'Tạo thành công'))
    } catch (error) {
        showError(error.message || 'Không thể lưu tầm nhìn')
    } finally {
        saving.value = false
    }
}

// ===== Delete =====
const deleteItem = async (id) => {
    if (!confirm('Xác nhận xóa mục này?')) return
    try {
        const response = await fetch(`${API_BASE}/about/missions/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`)
        await fetchMissions()
        showSuccess('Xóa thành công')
    } catch (error) {
        showError(error.message || 'Không thể xóa tầm nhìn')
    }
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) await fetchMissions()
})
</script>

<style scoped>
.about-missions-page { padding: 0; min-height: 100vh; }

.permission-check { display: flex; align-items: center; justify-content: center; min-height: 60vh; padding: 2rem; }
.loading-permission, .permission-denied { text-align: center; max-width: 520px; padding: 3rem 2rem; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.1); }
.loading-permission i { font-size: 3rem; color: #2196f3; margin-bottom: 1rem; }
.permission-denied i { font-size: 3rem; color: #f44336; margin-bottom: 1rem; }
.permission-denied h3 { color: #333; margin-bottom: 1rem; font-size: 1.4rem; }
.permission-denied p { color: #666; margin-bottom: 1.5rem; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; padding: 1.5rem 0; border-bottom: 2px solid #eee; }
.header-content h1 { color: #333; margin: 0 0 .5rem; display: flex; align-items: center; gap: 12px; font-size: 2rem; }
.header-content h1 i { color: #1976d2; }
.header-content p { margin: 0; color: #666; }
.header-actions { display: flex; gap: .75rem; flex-wrap: wrap; }

.loading-state { padding: 3rem 2rem; text-align: center; color: #666; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.08); }
.loading-state i { font-size: 2rem; margin-bottom: 1rem; color: #2196f3; }
.content-wrapper { display: grid; gap: 1.5rem; }

.form-section { background: #fff; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,.08); overflow: hidden; }
.form-header { padding: 1.25rem; border-bottom: 1px solid #eee; background: #f8f9fa; display: flex; justify-content: space-between; align-items: center; }
.form-header h3 { margin: 0; color: #333; font-size: 1.1rem; display: flex; align-items: center; gap: 10px; }
.btn-close { background: none; border: none; cursor: pointer; color: #666; font-size: 1.3rem; padding: 0; }
.btn-close:hover { color: #333; }
.item-form { padding: 1.25rem; }

.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-bottom: 1rem; }
.form-group { display: flex; flex-direction: column; gap: .45rem; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { color: #333; font-weight: 600; font-size: .95rem; }
.form-control { width: 100%; border: 1px solid #ddd; border-radius: 6px; padding: .7rem .8rem; font-size: .95rem; color: #333; background: #fff; font-family: inherit; }
.form-control:focus { outline: none; border-color: #1976d2; box-shadow: 0 0 0 3px rgba(25,118,210,.14); }
.form-control.is-invalid { border-color: #dc3545; }
.field-error { margin: 0; color: #dc3545; font-size: .85rem; }
.field-hint { color: #6c757d; font-size: .82rem; }
.required { color: #dc3545; }

/* Type switch */
.type-switch { display: flex; gap: .5rem; }
.type-btn { flex: 1; padding: .6rem .9rem; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; font-weight: 500; color: #555; display: inline-flex; align-items: center; gap: .45rem; transition: all .2s; font-size: .9rem; }
.type-btn:hover { border-color: #1976d2; color: #1976d2; }
.type-btn.active { background: #1976d2; border-color: #1976d2; color: #fff; }

/* List editor */
.list-editor { display: flex; flex-direction: column; gap: .5rem; }
.list-row { display: flex; align-items: center; gap: .5rem; }
.list-key { flex: 0 0 200px; min-width: 0; }
.list-value { flex: 1; min-width: 0; }
.list-sep { font-weight: 700; color: #888; flex-shrink: 0; }
.btn-add-row { align-self: flex-start; margin-top: .25rem; padding: .5rem .9rem; font-size: .85rem; border: 1px dashed #1976d2; background: transparent; color: #1976d2; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: .4rem; transition: all .2s; }
.btn-add-row:hover { background: #e8f1fb; }

.form-actions { display: flex; justify-content: flex-end; gap: .75rem; }

/* Cards */
.missions-list { background: #fff; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,.08); padding: 1.5rem; }
.empty-state { text-align: center; padding: 2rem; color: #999; }
.empty-state i { font-size: 3rem; margin-bottom: 1rem; opacity: .5; }
.missions-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }

.mission-card { background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 1.5rem; transition: all .2s; }
.mission-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.1); border-color: #1976d2; }
.mission-card.is-inactive { opacity: .7; background: #f8f9fa; }
.mission-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
.mission-icon-display { font-size: 2rem; color: #1976d2; }
.mission-icon-display .text-muted { color: #ccc; }
.mission-actions { display: flex; gap: .5rem; }
.mission-title { margin: 0 0 .75rem; font-size: 1.1rem; color: #333; font-weight: 600; }
.mission-description { margin: 0 0 1rem; color: #666; font-size: .95rem; line-height: 1.5; }

/* List preview in card */
.mission-list-preview { list-style: none; padding: 0; margin: 0 0 1rem; }
.mission-list-preview li { padding: .3rem 0; font-size: .9rem; color: #555; border-bottom: 1px dotted #eee; }
.mission-list-preview li:last-child { border-bottom: none; }
.mission-list-preview strong { color: #333; }

.mission-meta { display: flex; align-items: center; gap: .75rem; font-size: .85rem; padding-top: 1rem; border-top: 1px solid #eee; flex-wrap: wrap; }

.badge { padding: .25rem .6rem; border-radius: 4px; font-size: .75rem; font-weight: 500; }
.badge-inactive { background: #fff3cd; color: #856404; }
.badge-paragraph { background: #e3f2fd; color: #1565c0; }
.badge-list { background: #e8f5e9; color: #2e7d32; }
.text-muted { color: #999; }
.text-small { font-size: .85rem; }

.btn-icon { background: none; border: none; cursor: pointer; color: #666; padding: .5rem; border-radius: 4px; transition: all .2s; }
.btn-icon:hover { background: #f0f0f0; color: #333; }
.btn-icon.btn-danger:hover { background: #ffebee; color: #dc3545; }
.btn-icon:disabled { opacity: .4; cursor: not-allowed; }

.icon-preview-chip { display: inline-flex; align-items: center; gap: .35rem; margin-left: .45rem; padding: .15rem .45rem; border-radius: 999px; background: #eef5ff; color: #204a78; font-size: .78rem; font-weight: 600; }

.btn { padding: .75rem 1.1rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; text-decoration: none; display: inline-flex; align-items: center; gap: .5rem; transition: all .2s; font-size: .92rem; }
.btn:disabled { opacity: .65; cursor: not-allowed; }
.btn-primary { background: #1976d2; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #1565c0; }
.btn-secondary { background: #f0f2f5; color: #495057; }
.btn-secondary:hover:not(:disabled) { background: #e7eaef; }

@media (max-width: 992px) {
    .page-header { flex-direction: column; align-items: flex-start; }
    .header-actions { width: 100%; justify-content: flex-start; }
    .form-grid { grid-template-columns: 1fr; }
    .missions-cards { grid-template-columns: 1fr; }
    .list-key { flex: 0 0 150px; }
}

@media (max-width: 640px) {
    .header-content h1 { font-size: 1.45rem; }
    .form-actions { flex-direction: column; }
    .btn { width: 100%; justify-content: center; }
    .type-switch { flex-direction: column; }
    .list-row { flex-wrap: wrap; }
    .list-key, .list-value { flex: 0 0 100%; }
    .list-sep { display: none; }
}
</style>
