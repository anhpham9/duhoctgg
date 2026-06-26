<template>
    <div class="notifications-management-page">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-content">
                <h1><i class="fas fa-bell"></i> Quản lý thông báo</h1>
                <p class="header-subtitle">Xem và quản lý tất cả thông báo của bạn</p>
            </div>
            <div class="header-stats">
                <div class="stat-item">
                    <span class="stat-label">Tổng cộng</span>
                    <span class="stat-value">{{ total }}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Chưa xem</span>
                    <span class="stat-value">{{ notifications.filter(n => !n.is_read).length }}</span>
                </div>
            </div>
        </div>

        <!-- Controls Section -->
        <div class="controls-section">
            <div class="controls-row">
                <!-- Search Box -->
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input 
                        type="text" 
                        :value="searchQuery" 
                        @input="setSearchQuery($event.target.value)"
                        placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                        class="search-input"
                    />
                    <button v-if="searchQuery" @click="setSearchQuery('')" class="clear-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Type Filter -->
                <div class="filter-group">
                    <label>Loại thông báo:</label>
                    <select :value="selectedType" @change="setType($event.target.value)" class="filter-select">
                        <option value="">Tất cả</option>
                        <option v-for="type in notificationTypes" :key="type.value" :value="type.value">
                            {{ type.label }}
                        </option>
                    </select>
                </div>

                <!-- Status Filter -->
                <div class="filter-group">
                    <label>Trạng thái:</label>
                    <select :value="selectedStatus" @change="setStatus($event.target.value)" class="filter-select">
                        <option value="">Tất cả</option>
                        <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                            {{ status.label }}
                        </option>
                    </select>
                </div>

                <!-- Items per page -->
                <div class="filter-group">
                    <label>Hiển thị:</label>
                    <select :value="limit" @change="setItemsPerPage(parseInt($event.target.value))" class="filter-select">
                        <option v-for="option in itemsPerPageOptions" :key="option" :value="option">
                            {{ option }} / trang
                        </option>
                    </select>
                </div>

                <!-- Clear Filters -->
                <button 
                    v-if="searchQuery || selectedType || selectedStatus"
                    @click="clearFilters" 
                    class="btn btn-outline-secondary"
                    style="margin-top: 24px;"
                >
                    <i class="fas fa-eraser"></i> Xóa bộ lọc
                </button>
            </div>
        </div>

        <!-- Main Content -->
        <div class="notifications-container">
            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải thông báo...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>{{ error }}</p>
                <button @click="fetchNotifications" class="btn btn-primary">Thử lại</button>
            </div>

            <!-- Empty State -->
            <div v-else-if="notifications.length === 0" class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>Không có thông báo nào</h3>
                <p v-if="searchQuery || selectedType || selectedStatus">
                    Không tìm thấy thông báo phù hợp với bộ lọc của bạn.
                </p>
                <p v-else>
                    Bạn sẽ nhận được thông báo khi có hoạt động mới.
                </p>
            </div>

            <!-- Notifications List -->
            <div v-else class="notifications-list">
                <div 
                    v-for="notification in notifications" 
                    :key="notification.id"
                    class="notification-card"
                    :class="{ 'unread': !notification.is_read }"
                >
                    <!-- Icon -->
                    <div class="notification-icon" :class="notification.color">
                        <i :class="notification.icon"></i>
                    </div>

                    <!-- Content -->
                    <div class="notification-content">
                        <div class="content-header">
                            <h3 class="notification-title">{{ notification.title }}</h3>
                            <span class="notification-time">{{ formatTimeAgo(notification.created_at) }}</span>
                        </div>
                        <p class="notification-message">{{ notification.message }}</p>
                        <div class="notification-meta">
                            <span class="type-badge" :class="notification.color">
                                {{ getTypeLabel(notification.type) }}
                            </span>
                            <span v-if="!notification.is_read" class="status-badge unread">
                                <i class="fas fa-circle"></i> Chưa xem
                            </span>
                            <span v-else class="status-badge read">
                                <i class="fas fa-check-circle"></i> Đã xem
                            </span>
                            <span class="date-badge">
                                <i class="fas fa-calendar"></i> {{ formatDate(notification.created_at) }}
                            </span>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="notification-actions">
                        <button 
                            v-if="!notification.is_read"
                            @click="markAsRead(notification.id)"
                            class="btn-action btn-mark-read"
                            title="Đánh dấu đã xem"
                        >
                            <i class="fas fa-check"></i>
                        </button>
                        <button 
                            @click="openDeleteModal(notification.id)"
                            class="btn-action btn-delete"
                            title="Xóa thông báo"
                        >
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
            <div class="modal-dialog" @click.stop>
                <div class="modal-header">
                    <h4 class="modal-title">
                        <i class="fas fa-exclamation-circle" style="color: #ff6b6b; margin-right: 10px;"></i>
                        Xác nhận xóa
                    </h4>
                    <button class="modal-close" @click="closeDeleteModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Bạn có chắc chắn muốn xóa thông báo này?</p>
                    <p class="text-muted">Thao tác này không thể được hoàn tác.</p>
                </div>
                <div class="modal-footer">
                    <button @click="closeDeleteModal" class="btn btn-secondary">
                        <i class="fas fa-times"></i> Hủy
                    </button>
                    <button @click="confirmDelete" class="btn btn-danger">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1 && notifications.length > 0" class="pagination-section">
            <div class="pagination-info">
                Hiển thị {{ ((currentPage - 1) * limit) + 1 }} - {{ Math.min(currentPage * limit, total) }}
                trong tổng số {{ total }} thông báo
            </div>
            <div class="pagination-controls">
                <button 
                    @click="goToPage(1)" 
                    :disabled="currentPage === 1" 
                    class="btn-page"
                    title="Trang đầu"
                >
                    <i class="fas fa-angle-double-left"></i>
                </button>
                <button 
                    @click="goToPage(currentPage - 1)" 
                    :disabled="currentPage === 1" 
                    class="btn-page"
                    title="Trang trước"
                >
                    <i class="fas fa-angle-left"></i>
                </button>

                <!-- Page numbers -->
                <div class="page-numbers">
                    <span v-if="currentPage > 2" class="page-number">
                        <button @click="goToPage(1)" class="btn-page">1</button>
                    </span>
                    <span v-if="currentPage > 3" class="page-dots">...</span>
                    
                    <span 
                        v-for="page in visiblePages" 
                        :key="page"
                        class="page-number"
                    >
                        <button 
                            @click="goToPage(page)" 
                            :class="['btn-page', { 'active': page === currentPage }]"
                        >
                            {{ page }}
                        </button>
                    </span>

                    <span v-if="currentPage < totalPages - 2" class="page-dots">...</span>
                    <span v-if="currentPage < totalPages - 1" class="page-number">
                        <button @click="goToPage(totalPages)" class="btn-page">{{ totalPages }}</button>
                    </span>
                </div>

                <button 
                    @click="goToPage(currentPage + 1)" 
                    :disabled="currentPage === totalPages" 
                    class="btn-page"
                    title="Trang sau"
                >
                    <i class="fas fa-angle-right"></i>
                </button>
                <button 
                    @click="goToPage(totalPages)" 
                    :disabled="currentPage === totalPages" 
                    class="btn-page"
                    title="Trang cuối"
                >
                    <i class="fas fa-angle-double-right"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { useNotificationsListAPI } from '~/composables/useNotificationsListAPI'

definePageMeta({
    middleware: ['auth'],
    layout: 'admin',
    ssr: false
})

// ========================================
// PERMISSION CHECK
// ========================================

const { currentUser, fetchCurrentUser } = useCurrentUser()

const hasPermission = computed(() => {
    return currentUser.value && currentUser.value.id
})

// ========================================
// NOTIFICATIONS API
// ========================================

const {
    notifications,
    loading,
    error,
    currentPage,
    limit,
    total,
    totalPages,
    itemsPerPageOptions,
    searchQuery,
    selectedType,
    selectedStatus,
    notificationTypes,
    statusOptions,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    setSearchQuery,
    setType,
    setStatus,
    setItemsPerPage,
    goToPage,
    clearFilters,
    formatDate,
    formatTimeAgo,
    getTypeLabel
} = useNotificationsListAPI()

// ========================================
// DELETE CONFIRMATION MODAL
// ========================================

const showDeleteModal = ref(false)
const notificationToDelete = ref(null)

const openDeleteModal = (notificationId) => {
    notificationToDelete.value = notificationId
    showDeleteModal.value = true
}

const closeDeleteModal = () => {
    showDeleteModal.value = false
    notificationToDelete.value = null
}

const confirmDelete = async () => {
    if (notificationToDelete.value) {
        await deleteNotification(notificationToDelete.value)
        closeDeleteModal()
    }
}

// ========================================
// PAGINATION HELPERS
// ========================================

const visiblePages = computed(() => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages.value <= maxVisiblePages) {
        for (let i = 1; i <= totalPages.value; i++) {
            pages.push(i)
        }
    } else {
        const start = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2))
        const end = Math.min(totalPages.value, start + maxVisiblePages - 1)
        
        for (let i = start; i <= end; i++) {
            pages.push(i)
        }
    }
    
    return pages
})

// ========================================
// LIFECYCLE HOOKS
// ========================================

onMounted(async () => {
    await fetchCurrentUser()
    
    if (hasPermission.value) {
        await fetchNotifications()
    }
})
</script>

<style scoped>
.notifications-management-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    background: #f5f5f5;
    min-height: 100vh;
}

/* ========================================
   Page Header
   ======================================== */

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    gap: 20px;
}

.header-content h1 {
    font-size: 28px;
    margin: 0 0 10px 0;
    color: #333;
    display: flex;
    align-items: center;
    gap: 15px;
}

.header-content h1 i {
    color: #ff9800;
    font-size: 32px;
}

.header-subtitle {
    color: #666;
    margin: 0;
    font-size: 14px;
}

.header-stats {
    display: flex;
    gap: 20px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px 25px;
    background: #f9f9f9;
    border-radius: 8px;
    border-left: 4px solid #ff9800;
}

.stat-label {
    font-size: 12px;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-top: 5px;
}

/* ========================================
   Controls Section
   ======================================== */

.controls-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.controls-row {
    display: grid;
    grid-template-columns: 1fr auto auto auto auto;
    gap: 15px;
    align-items: flex-end;
    flex-wrap: wrap;
}

.search-box {
    display: flex;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0 12px;
    background: white;
    position: relative;
}

.search-box i {
    color: #999;
    margin-right: 8px;
}

.search-input {
    flex: 1;
    border: none;
    padding: 10px 0;
    font-size: 14px;
    outline: none;
}

.search-input::placeholder {
    color: #ccc;
}

.clear-btn {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 5px;
    font-size: 14px;
}

.clear-btn:hover {
    color: #333;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.filter-group label {
    font-size: 12px;
    color: #666;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.filter-select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    background: white;
    cursor: pointer;
}

.filter-select:hover {
    border-color: #999;
}

.filter-select:focus {
    outline: none;
    border-color: #ff9800;
}

/* ========================================
   Notifications Container
   ======================================== */

.notifications-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    min-height: 300px;
}

.loading-state,
.error-state,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
}

.loading-state i,
.error-state i,
.empty-state i {
    font-size: 48px;
    margin-bottom: 15px;
    opacity: 0.5;
}

.loading-state i {
    animation: fa-spin 1s infinite linear;
    color: #ff9800;
}

.error-state i {
    color: #f44336;
}

.empty-state i {
    color: #999;
}

.error-state p,
.empty-state p {
    color: #666;
    margin: 10px 0;
}

.empty-state h3 {
    color: #333;
    margin: 10px 0 15px 0;
}

/* ========================================
   Notifications List
   ======================================== */

.notifications-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
}

.notification-card {
    display: flex;
    gap: 15px;
    padding: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    transition: all 0.3s ease;
    align-items: center;
}

.notification-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #ff9800;
}

.notification-card.unread {
    background: #fffbf0;
    border-left: 4px solid #ff9800;
}

.notification-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    font-size: 20px;
    color: white;
    flex-shrink: 0;
}

.notification-icon.blue {
    background: #2196f3;
}

.notification-icon.green {
    background: #4caf50;
}

.notification-icon.red {
    background: #f44336;
}

.notification-icon.orange {
    background: #ff9800;
}

.notification-icon.gray {
    background: #9e9e9e;
}

.notification-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.content-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.notification-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin: 0;
    flex: 1;
}

.notification-time {
    font-size: 12px;
    color: #999;
    white-space: nowrap;
}

.notification-message {
    font-size: 14px;
    color: #666;
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.notification-meta {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
}

.type-badge {
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 20px;
    color: white;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.type-badge.blue {
    background: #2196f3;
}

.type-badge.green {
    background: #4caf50;
}

.type-badge.red {
    background: #f44336;
}

.type-badge.orange {
    background: #ff9800;
}

.type-badge.gray {
    background: #9e9e9e;
}

.status-badge {
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 5px;
    font-weight: 600;
}

.status-badge.unread {
    background: #fff3cd;
    color: #856404;
}

.status-badge.read {
    background: #d4edda;
    color: #155724;
}

.status-badge i {
    font-size: 10px;
}

.date-badge {
    font-size: 12px;
    color: #999;
    display: flex;
    align-items: center;
    gap: 5px;
}

/* ========================================
   Notification Actions
   ======================================== */

.notification-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
    min-width: 80px;
    padding-left: 10px;
}

.btn-action {
    background: none;
    border: 1px solid #ddd;
    width: 36px;
    height: 36px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.3s ease;
}

.btn-action:hover {
    border-color: #999;
    background: #f5f5f5;
}

.btn-action.btn-mark-read {
    color: #4caf50;
}

.btn-action.btn-mark-read:hover {
    border-color: #4caf50;
    background: #f1f8f4;
}

.btn-action.btn-delete {
    color: #f44336;
}

.btn-action.btn-delete:hover {
    border-color: #f44336;
    background: #fef5f5;
}

/* ========================================
   Pagination
   ======================================== */

.pagination-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    flex-wrap: wrap;
    gap: 15px;
}

.pagination-info {
    font-size: 14px;
    color: #666;
}

.pagination-controls {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
}

.page-numbers {
    display: flex;
    gap: 5px;
}

.page-dots {
    color: #999;
    padding: 0 5px;
}

.btn-page {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-page:hover:not(:disabled) {
    border-color: #ff9800;
    color: #ff9800;
}

.btn-page.active {
    background: #ff9800;
    color: white;
    border-color: #ff9800;
}

.btn-page:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* ========================================
   Responsive Design
   ======================================== */

@media (max-width: 1200px) {
    .controls-row {
        grid-template-columns: 1fr auto auto;
    }
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
    }

    .header-stats {
        width: 100%;
        justify-content: flex-start;
    }

    .controls-row {
        grid-template-columns: 1fr;
    }

    .notification-card {
        flex-direction: column;
        align-items: flex-start;
    }

    .notification-actions {
        justify-content: flex-start;
        margin-top: 10px;
        width: 100%;
    }

    .content-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .pagination-section {
        flex-direction: column;
        align-items: flex-start;
    }
}

@keyframes fa-spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

/* ========================================
   Delete Confirmation Modal
   ======================================== */

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.modal-dialog {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-width: 400px;
    width: 90%;
    animation: slideUp 0.3s ease;
    overflow: hidden;
}

@keyframes slideUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
}

.modal-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
}

.modal-close {
    background: none;
    border: none;
    font-size: 20px;
    color: #999;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.modal-close:hover {
    background: #f5f5f5;
    color: #333;
}

.modal-body {
    padding: 20px;
}

.modal-body p {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #333;
}

.modal-body .text-muted {
    color: #999;
    font-size: 13px;
    margin-bottom: 0;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 15px 20px;
    border-top: 1px solid #eee;
    background: #fafafa;
}

.btn {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.btn-secondary {
    background: white;
    color: #666;
    border-color: #ddd;
}

.btn-secondary:hover {
    background: #f5f5f5;
    border-color: #bbb;
}

.btn-danger {
    background: #ff6b6b;
    color: white;
    border-color: #ff6b6b;
}

.btn-danger:hover {
    background: #ff5252;
    border-color: #ff5252;
}
</style>