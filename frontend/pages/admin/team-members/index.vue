<template>
    <div class="team-members-page">
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
                        <i class="fas fa-users"></i>
                        Quản lý Đội ngũ Chuyên gia
                    </h1>
                    <p>Cập nhật thông tin, ảnh, vị trí và liên hệ xã hội của các thành viên đội</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" :disabled="loading" @click="fetchMembers">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                        Làm mới
                    </button>
                    <NuxtLink to="/admin/team-members/create" class="btn btn-primary">
                        <i class="fas fa-plus"></i>
                        Thêm thành viên
                    </NuxtLink>
                </div>
            </div>

            <div v-if="loading" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải dữ liệu...</p>
            </div>

            <div v-else class="members-container">
                <div v-if="members.length === 0" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Chưa có thành viên nào. Thêm thành viên đầu tiên để bắt đầu.</p>
                    <NuxtLink to="/admin/team-members/create" class="btn btn-primary">
                        <i class="fas fa-plus"></i>
                        Thêm thành viên
                    </NuxtLink>
                </div>

                <div v-else class="members-grid">
                    <div v-for="member in members" :key="member.id" class="member-card" :class="{ 'is-inactive': !member.is_active }">
                        <div class="member-image">
                            <img v-if="member.photo_url" :src="member.photo_url" :alt="member.name" class="member-photo">
                            <div v-else class="member-photo-empty">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="member-actions-overlay">
                                <NuxtLink :to="`/admin/team-members/${member.id}/edit`" class="btn-action" title="Chỉnh sửa">
                                    <i class="fas fa-edit"></i>
                                </NuxtLink>
                                <button class="btn-action btn-danger" type="button" @click="deleteMember(member.id)" title="Xóa">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>

                        <div class="member-info">
                            <h3 class="member-name">{{ member.name }}</h3>
                            <p class="member-position">{{ member.position }}</p>
                            <p class="member-description">{{ truncateText(member.description, 80) }}</p>

                            <div class="member-meta">
                                <span v-if="!member.is_active" class="badge badge-inactive">Ẩn</span>
                                <span class="text-muted text-small">Thứ tự: {{ member.sort_order }}</span>
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
import { computed, onMounted, ref } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { useNotifications } from '~/composables/useNotifications'

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'permission'],
    ssr: false
})

useHead({
    title: 'Quản lý Đội ngũ - Admin'
})

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2, 3]))

const members = ref([])
const loading = ref(false)

const truncateText = (text, length) => {
    if (!text) return ''
    if (text.length > length) return text.substring(0, length) + '...'
    return text
}

const fetchMembers = async () => {
    loading.value = true
    try {
        const response = await fetch(`${API_BASE}/about/team-members/admin`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        members.value = data?.data || []
    } catch (error) {
        showError(error.message || 'Không thể tải danh sách thành viên')
    } finally {
        loading.value = false
    }
}

const deleteMember = async (id) => {
    if (!confirm('Xác nhận xóa thành viên này? Ảnh sẽ bị xóa khỏi Cloudinary.')) return

    try {
        const response = await fetch(`${API_BASE}/about/team-members/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        await fetchMembers()
        showSuccess('Xóa thành công')
    } catch (error) {
        showError(error.message || 'Không thể xóa thành viên')
    }
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await fetchMembers()
    }
})
</script>

<style scoped>
.team-members-page {
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
    margin-bottom: 1.5rem;
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

.members-container {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    padding: 1.5rem;
}

.empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: #999;
}

.empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.empty-state p {
    margin-bottom: 1.5rem;
}

.members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.5rem;
}

.member-card {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.2s ease;
}

.member-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #1976d2;
}

.member-card.is-inactive {
    opacity: 0.7;
    background: #f8f9fa;
}

.member-image {
    position: relative;
    width: 100%;
    height: 220px;
    background: #f0f0f0;
    overflow: hidden;
}

.member-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s ease;
}

.member-card:hover .member-photo {
    transform: scale(1.05);
}

.member-photo-empty {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #e0e0e0, #f5f5f5);
    color: #999;
    font-size: 3rem;
}

.member-actions-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.member-card:hover .member-actions-overlay {
    opacity: 1;
}

.btn-action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: #1976d2;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    text-decoration: none;
    font-size: 1rem;
    transition: all 0.2s;
}

.btn-action:hover {
    background: #1565c0;
}

.btn-action.btn-danger {
    background: #dc3545;
}

.btn-action.btn-danger:hover {
    background: #c82333;
}

.member-info {
    padding: 1.25rem;
}

.member-name {
    margin: 0 0 0.35rem;
    color: #333;
    font-size: 1.1rem;
    font-weight: 600;
}

.member-position {
    margin: 0 0 0.5rem;
    color: #1976d2;
    font-size: 0.9rem;
    font-weight: 500;
}

.member-description {
    margin: 0 0 0.75rem;
    color: #666;
    font-size: 0.9rem;
    line-height: 1.4;
}

.member-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.85rem;
    padding-top: 0.75rem;
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

@media (max-width: 992px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .header-actions {
        width: 100%;
        justify-content: flex-start;
    }

    .members-grid {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    }
}

@media (max-width: 640px) {
    .header-content h1 {
        font-size: 1.45rem;
    }

    .members-grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }

    .member-info {
        padding: 1rem;
    }

    .member-name {
        font-size: 1rem;
    }
}
</style>
