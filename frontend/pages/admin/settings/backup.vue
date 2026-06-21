<template>
    <div class="settings-backup-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Không thể truy cập Sao lưu và Khôi phục</h3>
                <p>Chỉ Superadmin và Admin mới có thể thao tác dữ liệu backup.</p>
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
                        <i class="fas fa-database"></i>
                        Sao lưu và Khôi phục
                    </h1>
                    <p>Quản lý bản sao lưu, khôi phục dữ liệu và lịch chạy tự động.</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" :disabled="loading || creating || savingConfig" @click="refreshAll">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                        Làm mới
                    </button>
                    <button class="btn btn-primary" :disabled="creating || loading" @click="createBackup">
                        <i class="fas" :class="creating ? 'fa-spinner fa-spin' : 'fa-plus-circle'"></i>
                        {{ creating ? 'Đang tạo backup...' : 'Tạo backup thủ công' }}
                    </button>
                </div>
            </div>

            <div v-if="loading" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải dữ liệu backup...</p>
            </div>

            <div v-else-if="error" class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Lỗi: {{ error }}</p>
                <button class="btn btn-primary" @click="refreshAll">Thử lại</button>
            </div>

            <div v-else class="content-grid">
                <section class="card">
                    <div class="card-header">
                        <h2>
                            <i class="fas fa-clock"></i>
                            Backup tự động
                        </h2>
                    </div>
                    <div class="card-body">
                        <div class="toggle-row">
                            <label class="checkbox-label">
                                <input v-model="backupConfig.enabled" type="checkbox">
                                <span>Bật backup tự động hằng ngày</span>
                            </label>
                        </div>

                        <div class="form-group">
                            <label>Thời gian chạy mỗi ngày</label>
                            <input v-model="backupConfig.runAt" type="time" class="form-control">
                        </div>

                        <div class="form-group">
                            <label>Chính sách lưu trữ</label>
                            <input :value="30" type="number" class="form-control" disabled>
                            <small>Hệ thống luôn giữ tối đa 30 bản backup gần nhất.</small>
                        </div>

                        <div class="form-actions">
                            <button class="btn btn-primary" :disabled="savingConfig" @click="saveAutoBackupConfig">
                                <i class="fas" :class="savingConfig ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                                {{ savingConfig ? 'Đang lưu...' : 'Lưu cấu hình tự động' }}
                            </button>
                        </div>
                    </div>
                </section>

                <section class="card">
                    <div class="card-header">
                        <h2>
                            <i class="fas fa-file-upload"></i>
                            Upload và Khôi phục
                        </h2>
                    </div>
                    <div class="card-body">
                        <input
                            ref="fileInputRef"
                            class="hidden-input"
                            type="file"
                            accept=".zip,.sql,.json,.bak"
                            @change="handleFileSelected"
                        >

                        <div class="form-actions compact">
                            <button class="btn btn-secondary" :disabled="uploading" @click="triggerUploadPicker">
                                <i class="fas" :class="uploading ? 'fa-spinner fa-spin' : 'fa-upload'"></i>
                                {{ uploading ? 'Đang upload...' : 'Upload backup' }}
                            </button>
                        </div>

                        <p class="help-text">
                            Upload chỉ nhập file vào hệ thống. Khôi phục dữ liệu cần thao tác Restore riêng trên từng bản backup.
                        </p>

                        <div class="danger-zone">
                            <h3>Cảnh báo</h3>
                            <p>Khôi phục sẽ ghi đè dữ liệu hiện tại và không thể hoàn tác.</p>
                        </div>
                    </div>
                </section>

                <section class="card history-card">
                    <div class="card-header">
                        <h2>
                            <i class="fas fa-history"></i>
                            Lịch sử backup
                        </h2>
                        <p>{{ backups.length }} bản sao lưu</p>
                    </div>

                    <div v-if="!backups.length" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>Chưa có bản backup nào.</p>
                    </div>

                    <div v-else class="table-wrap">
                        <table class="history-table">
                            <thead>
                                <tr>
                                    <th>Tên backup</th>
                                    <th>Loại</th>
                                    <th>Thời gian</th>
                                    <th>Kích thước</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in backups" :key="item.id">
                                    <td>{{ item.name }}</td>
                                    <td>
                                        <span class="type-badge">{{ item.typeLabel }}</span>
                                    </td>
                                    <td>{{ formatDateTime(item.createdAt) }}</td>
                                    <td>{{ formatSize(item.size) }}</td>
                                    <td>
                                        <span class="status-badge" :class="statusClass(item.status)">
                                            {{ item.statusLabel }}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="table-actions">
                                            <button
                                                class="btn btn-sm btn-secondary"
                                                :disabled="downloadingId === item.id"
                                                @click="downloadBackup(item)"
                                            >
                                                <i class="fas" :class="downloadingId === item.id ? 'fa-spinner fa-spin' : 'fa-download'"></i>
                                                Tải
                                            </button>
                                            <button
                                                class="btn btn-sm btn-warning"
                                                :disabled="restoringId === item.id"
                                                @click="restoreBackup(item)"
                                            >
                                                <i class="fas" :class="restoringId === item.id ? 'fa-spinner fa-spin' : 'fa-undo'"></i>
                                                Restore
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
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
import { formatDate as formatSystemDate } from '~/utils/date'

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'permission'],
    ssr: false
})

useHead({
    title: 'Sao lưu và Khôi phục - Admin'
})

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError, showInfo, showWarning } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2]))

const loading = ref(false)
const creating = ref(false)
const uploading = ref(false)
const savingConfig = ref(false)
const restoringId = ref(null)
const downloadingId = ref(null)
const error = ref('')
const backups = ref([])
const fileInputRef = ref(null)

const backupConfig = reactive({
    enabled: true,
    runAt: '02:00',
    frequency: 'daily',
    retentionCount: 30
})

const normalizeBackupItem = (item = {}) => {
    const type = String(item.type || item.backup_type || 'manual').toLowerCase()
    const status = String(item.status || 'success').toLowerCase()

    return {
        id: item.id || item.backup_id || item.fileName || `${Date.now()}-${Math.random()}`,
        name: item.name || item.file_name || item.fileName || 'backup',
        type,
        typeLabel: type === 'auto' ? 'Tự động' : type === 'upload' ? 'Upload' : 'Thủ công',
        createdAt: item.createdAt || item.created_at || item.createdAtIso || new Date().toISOString(),
        size: Number(item.size || item.file_size || 0),
        status,
        statusLabel: status === 'failed' ? 'Thất bại' : status === 'running' ? 'Đang chạy' : 'Thành công'
    }
}

const statusClass = (status) => {
    if (status === 'failed') return 'danger'
    if (status === 'running') return 'warning'
    return 'success'
}

const formatDateTime = (value) => {
    if (!value) return '-'
    return formatSystemDate(value)
}

const formatSize = (bytes) => {
    const value = Number(bytes || 0)
    if (value <= 0) return '-'

    const units = ['B', 'KB', 'MB', 'GB']
    let size = value
    let idx = 0
    while (size >= 1024 && idx < units.length - 1) {
        size /= 1024
        idx += 1
    }
    return `${size.toFixed(size >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`
}

const parseJsonSafe = async (response) => {
    try {
        return await response.json()
    } catch {
        return {}
    }
}

const fetchHistory = async () => {
    const response = await fetch(`${API_BASE}/settings/backups/history`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    })
    const data = await parseJsonSafe(response)

    if (!response.ok) {
        throw new Error(data?.message || `Không thể tải lịch sử backup (HTTP ${response.status})`)
    }

    const list = Array.isArray(data?.data) ? data.data : Array.isArray(data?.items) ? data.items : []
    backups.value = list.map(normalizeBackupItem)
}

const fetchBackupConfig = async () => {
    const response = await fetch(`${API_BASE}/settings/backups/config`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    })
    const data = await parseJsonSafe(response)

    if (!response.ok) {
        throw new Error(data?.message || `Không thể tải cấu hình backup (HTTP ${response.status})`)
    }

    const payload = data?.data || {}
    backupConfig.enabled = typeof payload.enabled === 'boolean' ? payload.enabled : true
    backupConfig.runAt = payload.runAt || payload.scheduleTime || '02:00'
    backupConfig.frequency = 'daily'
    backupConfig.retentionCount = 30
}

const refreshAll = async () => {
    loading.value = true
    error.value = ''

    try {
        await Promise.all([fetchHistory(), fetchBackupConfig()])
    } catch (err) {
        error.value = err.message || 'Không thể tải dữ liệu backup'
    } finally {
        loading.value = false
    }
}

const createBackup = async () => {
    creating.value = true
    try {
        const response = await fetch(`${API_BASE}/settings/backups/create`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'manual' })
        })
        const data = await parseJsonSafe(response)

        if (!response.ok) {
            throw new Error(data?.message || 'Không thể tạo backup thủ công')
        }

        showSuccess(data?.message || 'Tạo backup thủ công thành công')
        await fetchHistory()
    } catch (err) {
        showError(err.message || 'Không thể tạo backup thủ công')
    } finally {
        creating.value = false
    }
}

const triggerUploadPicker = () => {
    fileInputRef.value?.click()
}

const handleFileSelected = async (event) => {
    const file = event.target?.files?.[0]
    event.target.value = ''

    if (!file) return
    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
        showWarning('File backup quá lớn. Giới hạn tối đa 500MB')
        return
    }

    uploading.value = true
    try {
        const formData = new FormData()
        formData.append('backupFile', file)

        const response = await fetch(`${API_BASE}/settings/backups/upload`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        })
        const data = await parseJsonSafe(response)

        if (!response.ok) {
            throw new Error(data?.message || 'Upload backup thất bại')
        }

        showSuccess(data?.message || 'Upload backup thành công')
        await fetchHistory()
    } catch (err) {
        showError(err.message || 'Upload backup thất bại')
    } finally {
        uploading.value = false
    }
}

const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    window.URL.revokeObjectURL(url)
}

const downloadBackup = async (item) => {
    downloadingId.value = item.id
    try {
        const response = await fetch(`${API_BASE}/settings/backups/${encodeURIComponent(item.id)}/download`, {
            method: 'GET',
            credentials: 'include'
        })

        if (!response.ok) {
            const data = await parseJsonSafe(response)
            throw new Error(data?.message || 'Không thể tải file backup')
        }

        const blob = await response.blob()
        const filename = `${item.name || 'backup'}.zip`
        downloadBlob(blob, filename)
        showInfo('Đã bắt đầu tải backup')
    } catch (err) {
        showError(err.message || 'Không thể tải file backup')
    } finally {
        downloadingId.value = null
    }
}

const restoreBackup = async (item) => {
    const confirmed = window.confirm(
        'Khôi phục sẽ ghi đè dữ liệu hiện tại và không thể hoàn tác. Bạn có chắc muốn tiếp tục?'
    )

    if (!confirmed) return

    restoringId.value = item.id
    try {
        const response = await fetch(`${API_BASE}/settings/backups/restore`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ backupId: item.id })
        })
        const data = await parseJsonSafe(response)

        if (!response.ok) {
            throw new Error(data?.message || 'Không thể restore backup')
        }

        showSuccess(data?.message || 'Khôi phục dữ liệu thành công')
        await fetchHistory()
    } catch (err) {
        showError(err.message || 'Không thể restore backup')
    } finally {
        restoringId.value = null
    }
}

const saveAutoBackupConfig = async () => {
    savingConfig.value = true
    try {
        const payload = {
            enabled: Boolean(backupConfig.enabled),
            frequency: 'daily',
            runAt: backupConfig.runAt || '02:00',
            retentionCount: 30
        }

        const response = await fetch(`${API_BASE}/settings/backups/config`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        const data = await parseJsonSafe(response)

        if (!response.ok) {
            throw new Error(data?.message || 'Không thể lưu cấu hình backup tự động')
        }

        showSuccess(data?.message || 'Đã lưu cấu hình backup tự động')
    } catch (err) {
        showError(err.message || 'Không thể lưu cấu hình backup tự động')
    } finally {
        savingConfig.value = false
    }
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await refreshAll()
    }
})
</script>

<style scoped>
.settings-backup-page {
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
    gap: 1rem;
    align-items: flex-start;
    margin-bottom: 1rem;
    padding: 1.5rem 0;
    border-bottom: 2px solid #eee;
}

.header-content h1 {
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 2rem;
    color: #1f2937;
}

.header-content p {
    margin: 0;
    color: #64748b;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.content-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

.card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
}

.history-card {
    grid-column: 1 / -1;
}

.card-header {
    padding: 1rem 1rem 0.5rem;
    border-bottom: 1px solid #f1f5f9;
}

.card-header h2 {
    margin: 0;
    font-size: 1.15rem;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 8px;
}

.card-header p {
    margin: 0.4rem 0 0.6rem;
    color: #64748b;
    font-size: 0.92rem;
}

.card-body {
    padding: 1rem;
}

.form-group {
    margin-bottom: 0.9rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.45rem;
    color: #334155;
    font-weight: 600;
}

.form-control {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
}

.form-control:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.toggle-row {
    margin-bottom: 0.8rem;
}

.checkbox-label {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    font-weight: 600;
    color: #1e293b;
}

.help-text,
.form-group small {
    display: block;
    margin-top: 0.35rem;
    color: #64748b;
    font-size: 0.86rem;
}

.danger-zone {
    margin-top: 1rem;
    border: 1px solid #fecaca;
    background: #fef2f2;
    border-radius: 8px;
    padding: 0.8rem;
}

.danger-zone h3 {
    margin: 0 0 0.4rem;
    color: #991b1b;
    font-size: 0.95rem;
}

.danger-zone p {
    margin: 0;
    color: #b91c1c;
    font-size: 0.9rem;
}

.table-wrap {
    overflow-x: auto;
}

.history-table {
    width: 100%;
    border-collapse: collapse;
}

.history-table th,
.history-table td {
    text-align: left;
    padding: 0.75rem;
    border-bottom: 1px solid #f1f5f9;
    white-space: nowrap;
}

.history-table th {
    color: #475569;
    font-size: 0.85rem;
    font-weight: 700;
}

.type-badge {
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    font-size: 0.78rem;
    background: #eff6ff;
    color: #1d4ed8;
    font-weight: 700;
}

.status-badge {
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
}

.status-badge.success {
    color: #166534;
    background: #dcfce7;
}

.status-badge.warning {
    color: #92400e;
    background: #fef3c7;
}

.status-badge.danger {
    color: #991b1b;
    background: #fee2e2;
}

.table-actions {
    display: flex;
    gap: 0.45rem;
}

.empty-state {
    padding: 2rem;
    text-align: center;
    color: #64748b;
}

.empty-state i {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.loading-state,
.error-state {
    padding: 3rem 2rem;
    text-align: center;
    color: #64748b;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.loading-state i {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #2563eb;
}

.error-state i {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #f59e0b;
}

.hidden-input {
    display: none;
}

.form-actions {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.65rem;
}

.form-actions.compact {
    margin-top: 0;
    justify-content: flex-start;
}

.btn {
    padding: 0.7rem 1.1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
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

.btn-sm {
    padding: 0.45rem 0.65rem;
    font-size: 0.8rem;
}

.btn-primary {
    background: #2563eb;
    color: #fff;
}

.btn-primary:hover:not(:disabled) {
    background: #1d4ed8;
}

.btn-secondary {
    background: #f1f5f9;
    color: #334155;
}

.btn-secondary:hover:not(:disabled) {
    background: #e2e8f0;
}

.btn-warning {
    background: #f59e0b;
    color: #fff;
}

.btn-warning:hover:not(:disabled) {
    background: #d97706;
}

@media (max-width: 1024px) {
    .content-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
    }

    .header-actions,
    .form-actions {
        width: 100%;
    }

    .header-actions .btn,
    .form-actions .btn {
        flex: 1;
        justify-content: center;
    }
}
</style>