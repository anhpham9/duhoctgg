<template>
    <header class="main-header">
        <div class="header-left">
            <button class="sidebar-toggle mobile-toggle" @click="handleMobileToggle">
                <i class="fas fa-bars"></i>
            </button>

            <div class="breadcrumb">
                <span class="breadcrumb-item">Trang chủ</span>     
                <template v-for="(item, index) in breadcrumbItems" :key="index">
                    <i class="fas fa-chevron-right"></i>
                    <span v-if="index === breadcrumbItems.length - 1" class="breadcrumb-item active">
                        {{ item.label }}
                    </span>
                    <span v-else class="breadcrumb-item">
                        {{ item.label }}
                    </span>
                </template>
            </div>
        </div>

        <div class="header-right">
            <div class="header-search">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <label for="searchInput" hidden></label>
                    <input type="text" id="searchInput" placeholder="Tìm kiếm..." v-model="searchQuery">
                </div>
            </div>

            <div class="header-notifications">
                <button 
                    class="notification-btn" 
                    :class="{ 'has-unread': unreadCount > 0 }"
                    @click="toggleDropdown"
                    ref="notificationBtn"
                >
                    <i class="fas fa-bell"></i>
                    <span 
                        v-if="unreadCount > 0" 
                        class="notification-badge"
                    >{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
                </button>

                <!-- Notifications Dropdown -->
                <div 
                    class="notifications-dropdown" 
                    :class="{ 'show': isDropdownOpen }"
                    :style="{ display: isDropdownOpen ? 'block' : 'none' }"
                    ref="notificationsDropdown"
                >
                    <div class="dropdown-header">
                        <div class="dropdown-title">
                            <i class="fas fa-bell"></i>
                            <span>Thông báo ({{ unreadCount }})</span>
                        </div>
                        <button 
                            v-if="unreadCount > 0"
                            class="mark-all-btn" 
                            @click="openMarkAllModal"
                            title="Đánh dấu tất cả đã đọc"
                        >
                            <i class="fas fa-check-double"></i>
                        </button>
                    </div>

                    <div class="dropdown-body">
                        <div class="notifications-list">
                            <!-- Empty state -->
                            <div v-if="recentNotifications.length === 0" class="notification-empty">
                                <i class="fas fa-bell-slash"></i>
                                <p>Không có thông báo nào</p>
                            </div>
                            
                            <!-- Notification items -->
                            <div 
                                v-for="notification in recentNotifications" 
                                :key="notification.id"
                                class="notification-item" 
                                :class="{ 'read': notification.isRead, 'unread': !notification.isRead }"
                            >
                                <div class="notification-icon" :class="notification.type">
                                    <i :class="notification.icon"></i>
                                </div>
                                <div class="notification-content">
                                    <div class="notification-header">
                                        <h4 class="notification-title">{{ notification.title }}</h4>
                                        <span class="notification-time">{{ formatTimeAgo(notification.timestamp) }}</span>
                                    </div>
                                    <p class="notification-message">{{ notification.message }}</p>
                                </div>
                                <div class="notification-actions">
                                    <button 
                                        class="mark-read-btn" 
                                        @click="toggleNotificationReadStatus(notification)"
                                        :title="notification.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'"
                                    >
                                        <i :class="notification.isRead ? 'fas fa-envelope' : 'fas fa-check'"></i>
                                    </button>
                                    <button 
                                        class="notification-action-btn" 
                                        @click="handleNotificationClick(notification.action, notification)"
                                        title="Xem chi tiết"
                                    >
                                        <i class="fas fa-external-link-alt"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="dropdown-footer">
                        <NuxtLink to="/admin/notifications" @click="closeDropdown()" class="view-all-link">
                            <i class="fas fa-external-link-alt"></i>
                            Xem tất cả thông báo
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <div class="header-profile">
                <div class="profile-dropdown">
                    <button class="profile-btn" @click="toggleProfileMenu">
                        <img src="/assets/images/admin/av.png" alt="Admin" class="profile-avatar">
                        <span class="profile-name" v-if="!loadingUser">{{ userName }}</span>
                        <span class="profile-name loading" v-else><i class="fas fa-spinner fa-spin"></i></span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="profile-menu" :class="{ 'show': isProfileMenuOpen }">
                        <NuxtLink to="/admin/profile" @click="toggleProfileMenu"><i class="fas fa-user"></i> Hồ sơ</NuxtLink>
                        <hr>
                        <button @click="handleLogout" class="logout-btn">
                            <i class="fas fa-sign-out-alt"></i> Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Mark All Confirmation Modal -->
        <div v-if="showMarkAllModal" class="modal-overlay" @click="closeMarkAllModal">
            <div class="modal-dialog" @click.stop>
                <div class="modal-header">
                    <h4 class="modal-title">
                        <i class="fas fa-check-double" style="color: #ff9800; margin-right: 8px;"></i>
                        Xác nhận hành động
                    </h4>
                    <button class="modal-close" @click="closeMarkAllModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Bạn muốn đánh dấu <strong>tất cả {{ unreadCount }} thông báo chưa xem</strong> là đã đọc?</p>
                </div>
                <div class="modal-footer">
                    <button @click="closeMarkAllModal" class="btn-cancel">
                        <i class="fas fa-times"></i> Hủy
                    </button>
                    <button @click="confirmMarkAll" class="btn-confirm">
                        <i class="fas fa-check-double"></i> Xác nhận
                    </button>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup>
import "~/assets/css/admin/notifications.css";
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'

// ========================================
// ADMIN HEADER COMPONENT
// ========================================

const route = useRoute()
const searchQuery = ref('')
const isProfileMenuOpen = ref(false)

// ========================================
// USER PROFILE DATA  
// ========================================

const { 
    currentUser, 
    loadingUser, 
    fetchCurrentUser, 
    clearUser, 
    userName 
} = useCurrentUser()

// ========================================
// NOTIFICATIONS SYSTEM  
// ========================================

const notifications = ref([])
const isDropdownOpen = ref(false)
const unreadCount = ref(0)
const showMarkAllModal = ref(false)

// Template refs
const notificationBtn = ref(null)
const notificationsDropdown = ref(null)

// ========================================
// COMPUTED PROPERTIES
// ========================================

const breadcrumbItems = computed(() => {
    // Main page titles
    const pageTitles = {
        '/admin': 'Dashboard',
        '/admin/users': 'Người dùng',
        '/admin/contacts': 'Liên hệ',
        '/admin/schools': 'Trường học',
        '/admin/news': 'Tin tức',
        '/admin/settings': 'Cài đặt',
        '/admin/notifications': 'Thông báo',
        '/admin/profile': 'Hồ sơ cá nhân',
        '/admin/content': 'Nội dung',
        '/admin/faqs': 'Câu hỏi thường gặp',
        '/admin/team-members': 'Thành viên nhóm',
        '/admin/other': 'Khác'
    }
    
    // Sub-page titles mapping
    const subPageTitles = {
        '/admin/content/about': 'Về chúng tôi',
        '/admin/content/conditions': 'Điều khoản',
        '/admin/content/contact': 'Liên hệ',
        '/admin/content/homepage': 'Trang chủ',
        '/admin/content/news': 'Tin tức',
        '/admin/content/schools': 'Trường học',
        
        '/admin/faqs/create': 'Tạo FAQ',
        
        '/admin/news/categories': 'Danh mục',
        '/admin/news/create': 'Tạo tin tức',
        '/admin/news/news-categories': 'Danh mục tin tức',
        '/admin/news/edit': 'Chỉnh sửa',
        '/admin/news/view': 'Xem chi tiết',
        
        '/admin/other/about-content': 'Nội dung Về chúng tôi',
        '/admin/other/about-mission': 'Sứ mệnh',
        '/admin/other/about-reasons': 'Lý do',
        '/admin/other/about-stats': 'Thống kê',
        
        '/admin/schools/types': 'Loại trường',
        '/admin/schools/regions': 'Khu vực',
        '/admin/schools/reviews': 'Đánh giá',
        '/admin/schools/create': 'Tạo trường học',
        '/admin/schools/edit': 'Chỉnh sửa',
        '/admin/schools/view': 'Xem chi tiết',
        
        '/admin/settings/general': 'Chung',
        '/admin/settings/backup': 'Sao lưu',
        '/admin/settings/seo': 'SEO',
        '/admin/settings/socials': 'Mạng xã hội',
        '/admin/settings/permissions': 'Phân quyền',
        
        '/admin/team-members/create': 'Thêm thành viên'
    }
    
    const currentPath = route.path
    const breadcrumbs = []
    
    // If root admin page, no sub-breadcrumbs
    if (currentPath === '/admin') {
        return []
    }
    
    // Parse path segments
    const pathParts = currentPath.split('/').filter(Boolean) // ['admin', 'settings', 'backup']
    
    if (pathParts.length === 2) {
        // e.g., /admin/contacts
        const path = `/${pathParts.join('/')}`
        if (pageTitles[path]) {
            breadcrumbs.push({ label: pageTitles[path], path })
        }
    } else if (pathParts.length >= 3) {
        // e.g., /admin/settings/backup or /admin/news/edit/5
        
        // Add parent level (e.g., /admin/settings)
        const parentPath = `/${pathParts.slice(0, 2).join('/')}`
        if (pageTitles[parentPath]) {
            breadcrumbs.push({ label: pageTitles[parentPath], path: parentPath })
        }
        
        // Add sub-level
        // Try exact match first
        if (subPageTitles[currentPath]) {
            breadcrumbs.push({ label: subPageTitles[currentPath], path: currentPath })
        } else {
            // Try without ID (for dynamic routes like /admin/news/edit/5 → /admin/news/edit)
            const pathWithoutId = `/${pathParts.slice(0, -1).join('/')}`
            if (subPageTitles[pathWithoutId]) {
                breadcrumbs.push({ label: subPageTitles[pathWithoutId], path: pathWithoutId })
            } else {
                // Fallback: show the last segment as-is
                const lastSegment = pathParts[pathParts.length - 1]
                breadcrumbs.push({ 
                    label: lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1), 
                    path: currentPath 
                })
            }
        }
    }
    
    return breadcrumbs
})

// Keep currentPageTitle for backward compatibility if needed
const currentPageTitle = computed(() => {
    const items = breadcrumbItems.value
    return items.length > 0 ? items[items.length - 1].label : 'Dashboard'
})

const recentNotifications = computed(() => {
    return notifications.value.slice(0, 6)
})

// ========================================
// NOTIFICATION DATA MANAGEMENT
// ========================================

const loadNotifications = async () => {
    try {
        const config = useRuntimeConfig()
        const response = await fetch(`${config.public.apiBase}/notifications?limit=6`, {
            credentials: 'include'
        })
        const result = await response.json()
        
        if (result.success) {
            notifications.value = result.data.map(n => ({
                id: n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                timestamp: new Date(n.created_at),
                isRead: n.is_read,
                icon: getIconByType(n.type),
                action: n.data?.action || 'dashboard',
                data: n.data || {}  // Store full data object for accessing contact_id, etc.
            }))
            updateUnreadCount()
        }
    } catch (error) {
        console.error('Load notifications error:', error)
        // Fallback to empty or mock data
        notifications.value = []
    }
}

/**
 * Fetch actual unread count from API
 * This is more accurate than filtering local array (which may be incomplete)
 */
const refreshUnreadCount = async () => {
    try {
        const config = useRuntimeConfig()
        const response = await fetch(`${config.public.apiBase}/notifications/unread-count`, {
            credentials: 'include'
        })
        const result = await response.json()
        
        if (result.success) {
            unreadCount.value = result.unread_count
        }
    } catch (error) {
        console.error('Failed to refresh unread count:', error)
        // Fallback: count from local notifications array
        unreadCount.value = notifications.value.filter(n => !n.isRead).length
    }
}

/**
 * Legacy: Update from local array (fallback only)
 */
const updateUnreadCount = () => {
    // Prefer API call instead - kept for backward compatibility
    refreshUnreadCount()
}

// ========================================
// DROPDOWN CONTROLS
// ========================================

const toggleDropdown = (event) => {
    event?.stopPropagation()
    if (isDropdownOpen.value) {
        closeDropdown()
    } else {
        openDropdown()
    }
}

const openDropdown = () => {
    isDropdownOpen.value = true
    // Close profile menu if open
    isProfileMenuOpen.value = false
}

const closeDropdown = () => {
    isDropdownOpen.value = false
}

const toggleProfileMenu = (event) => {
    event?.stopPropagation()
    isProfileMenuOpen.value = !isProfileMenuOpen.value
    // Close notification dropdown if open
    if (isProfileMenuOpen.value) {
        isDropdownOpen.value = false
    }
}

// ========================================
// SIDEBAR MOBILE CONTROLS  
// ========================================

const handleMobileToggle = () => {
    // Use global sidebar controls
    if (process.client && window.sidebarControls?.openMobileSidebar) {
        window.sidebarControls.openMobileSidebar()
    }
}

// ========================================
// NOTIFICATION ACTIONS
// ========================================

/**
 * Mark single notification as read via API
 */
const markAsRead = async (notificationId) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (!notification) return

    try {
        const config = useRuntimeConfig()
        const response = await fetch(`${config.public.apiBase}/notifications/${notificationId}/read`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const result = await response.json()
        
        if (result.success) {
            notification.isRead = true
            refreshUnreadCount()
        }
    } catch (error) {
        console.error('Failed to mark notification as read:', error)
    }
}

/**
 * Toggle notification read status (read/unread)
 */
const toggleNotificationReadStatus = async (notification) => {
    try {
        const config = useRuntimeConfig()
        const endpoint = notification.isRead ? 'unread' : 'read'
        
        const response = await fetch(`${config.public.apiBase}/notifications/${notification.id}/${endpoint}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const result = await response.json()
        
        if (result.success) {
            notification.isRead = !notification.isRead
            refreshUnreadCount()
            
            if (window.showToast) {
                const message = notification.isRead ? 'Đã đánh dấu đã đọc' : 'Đã đánh dấu chưa đọc'
                window.showToast(message, 'success')
            }
        }
    } catch (error) {
        console.error('Failed to toggle notification read status:', error)
        if (window.showToast) {
            window.showToast('Lỗi khi cập nhật trạng thái', 'error')
        }
    }
}

/**
 * Open mark all confirmation modal
 */
const openMarkAllModal = () => {
    showMarkAllModal.value = true
}

/**
 * Close mark all confirmation modal
 */
const closeMarkAllModal = () => {
    showMarkAllModal.value = false
}

/**
 * Confirm and execute mark all as read
 */
const confirmMarkAll = async () => {
    await markAllAsRead()
    closeMarkAllModal()
}

/**
 * Mark all notifications as read via API
 */
const markAllAsRead = async () => {
    try {
        const config = useRuntimeConfig()
        const response = await fetch(`${config.public.apiBase}/notifications/read-all`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const result = await response.json()
        
        if (result.success) {
            notifications.value.forEach(n => {
                n.isRead = true
            })
            refreshUnreadCount()
            
            if (window.showToast) {
                window.showToast('Đã đánh dấu tất cả thông báo là đã đọc', 'success')
            }
        }
    } catch (error) {
        console.error('Failed to mark all as read:', error)
        if (window.showToast) {
            window.showToast('Lỗi khi cập nhật thông báo', 'error')
        }
    }
}

const handleNotificationClick = async (action, notification) => {
    // Handle different notification actions with ID if available
    const routes = {
        'maintenance': '/admin/settings',
        'applications': '/admin/applications',
        'contacts': '/admin/contacts',
        'backup': '/admin/settings',
        'news': '/admin/news',
        'storage': '/admin/settings',
        'email': '/admin/settings',
        'dashboard': '/admin'
    }

    closeDropdown()

    let route = routes[action] || '/admin'
    
    // 🔔 Mark notification as read before navigating
    if (notification && !notification.isRead) {
        try {
            await markAsRead(notification.id)
        } catch (error) {
            console.error('Failed to mark notification as read:', error)
        }
    }
    
    // 📍 Add ID parameter if available
    if (notification?.data) {
        if (action === 'contacts' && notification.data.contact_id) {
            route = `/admin/contacts?view=${notification.data.contact_id}`
        } else if (action === 'news' && notification.data.news_id) {
            route = `/admin/news?view=${notification.data.news_id}`
        }
    }
    
    closeDropdown()
    
    // Show toast if available
    if (window.showToast) {
        window.showToast(`Đang chuyển đến ${action}...`, 'info')
    }
    
    // Navigate using Nuxt router
    setTimeout(() => {
        navigateTo(route)
    }, 500)
}

// ========================================
// USER ACTIONS
// ========================================

const handleLogout = async () => {
    if (process.client) {
        const config = useRuntimeConfig();
        
        try {
            // Show loading toast
            if (window.showToast) {
                window.showToast('Đang đăng xuất...', 'info')
            }
            
            // Call logout API to clear httpOnly cookie
            await fetch(`${config.public.apiBase}/auth/logout`, {
                method: 'POST',
                credentials: 'include' // Include cookies
            });
            
            // Clear shared user data
            clearUser()
            
            // Clean up any localStorage data
            localStorage.removeItem('token');
            localStorage.removeItem('rememberedUsername');
            localStorage.removeItem('rememberLogin');
            
            // Show success message
            if (window.showToast) {
                window.showToast('Đã đăng xuất thành công!', 'success')
            }
            
            // Redirect to login
            setTimeout(() => {
                navigateTo('/login')
            }, 500)
            
        } catch (error) {
            console.error('Logout error:', error);
            
            // Even if API fails, still clear user and redirect
            clearUser()
            
            if (window.showToast) {
                window.showToast('Đã đăng xuất', 'info')
            }
            
            // Clean up localStorage anyway
            localStorage.removeItem('token');
            localStorage.removeItem('rememberedUsername');  
            localStorage.removeItem('rememberLogin');
            
            setTimeout(() => {
                navigateTo('/login')
            }, 500)
        }
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now - timestamp) / 1000)
    
    if (diffInSeconds < 60) {
        return 'Vừa xong'
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `${minutes} phút trước`
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `${hours} giờ trước`
    } else {
        const days = Math.floor(diffInSeconds / 86400)
        return `${days} ngày trước`
    }
}

const simulateApiCall = (action, data = {}) => {
    // Simulate API call with loading state
    console.log(`API Call: ${action}`, data)
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, message: `${action} completed` })
        }, 500)
    })
}

// ========================================
// GLOBAL FUNCTIONS EXPOSURE
// ========================================

const addNotification = (message, type = 'info', title = 'Thông báo mới', actionData = {}) => {
    const newNotification = {
        id: Date.now(),
        type: type,
        title: title,
        message: message,
        timestamp: new Date(),
        isRead: false,
        icon: getIconByType(type),
        action: actionData.action || 'dashboard',
        data: actionData || {}
    }

    notifications.value.unshift(newNotification)
    updateUnreadCount()
    
    // Show toast for new notification
    if (window.showToast) {
        window.showToast(`${title}: ${message}`, type)
    }
}

const getIconByType = (type) => {
    const iconMap = {
        // Notification types
        'contact_submission': 'fas fa-envelope',           // Blue - Contact submission
        'backup_completed': 'fas fa-check-circle',         // Green - Backup completed
        'account_locked': 'fas fa-lock',                   // Red - Account locked
        'settings_changed': 'fas fa-cog',                  // Orange - Settings changed
        'news_published': 'fas fa-newspaper',              // News published
        'school_updated': 'fas fa-school',                 // School updated
        'user_registered': 'fas fa-user-plus',             // User registered
        'system_alert': 'fas fa-exclamation-triangle',     // System alert
        
        // Fallback for legacy types
        'success': 'fas fa-check-circle',
        'warning': 'fas fa-exclamation-triangle',
        'danger': 'fas fa-exclamation-circle',
        'info': 'fas fa-info-circle'
    }
    return iconMap[type] || 'fas fa-bell'
}

let refreshIntervalId = null

const handleDocumentClick = (e) => {
    if (!e.target.closest('.header-notifications')) {
        closeDropdown()
    }
    if (!e.target.closest('.header-profile')) {
        isProfileMenuOpen.value = false
    }
}

const handleDocumentKeydown = (e) => {
    if (e.key === 'Escape') {
        closeDropdown()
        isProfileMenuOpen.value = false
    }
}

// ========================================
// LIFECYCLE & EVENT HANDLERS
// ========================================

onMounted(async () => {
    // Small delay to ensure everything is ready
    await nextTick()
    
    // Fetch user profile data
    fetchCurrentUser()
    
    loadNotifications()
    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('keydown', handleDocumentKeydown)
    
    // Make notification system globally available
    if (process.client) {
        window.headerNotifications = {
            addNotification,
            markAllAsRead,
            getUnreadCount: () => unreadCount.value
        }
    }
    
    // Auto-refresh
    refreshIntervalId = setInterval(() => {
        loadNotifications()
    }, 30000) // 30 seconds
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick)
    document.removeEventListener('keydown', handleDocumentKeydown)

    if (refreshIntervalId) {
        clearInterval(refreshIntervalId)
        refreshIntervalId = null
    }

    if (process.client && window.headerNotifications) {
        delete window.headerNotifications
    }
})

// ========================================
// EXPOSE FOR EXTERNAL ACCESS  
// ========================================

defineExpose({
    addNotification,
    markAllAsRead,
    fetchCurrentUser, // Allow refreshing user data
    unreadCount: readonly(unreadCount),
    currentUser: readonly(currentUser),
    loadingUser: readonly(loadingUser)
})
</script>

<style scoped>
.profile-name.loading {
    opacity: 0.7;
    font-size: 0.9em;
}

.profile-name.loading i {
    animation: fa-spin 1s infinite linear;
}

@keyframes fa-spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.profile-menu.show {
    display: block;
}

.profile-menu {
    display: none;
}

/* ========================================
   Mark All Confirmation Modal
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
    max-width: 380px;
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
    font-size: 16px;
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
}

.modal-close {
    background: none;
    border: none;
    font-size: 18px;
    color: #999;
    cursor: pointer;
    padding: 0;
    width: 28px;
    height: 28px;
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
    margin: 0;
    font-size: 14px;
    color: #333;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 15px 20px;
    border-top: 1px solid #eee;
    background: #fafafa;
}

.btn-cancel,
.btn-confirm {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
}

.btn-cancel {
    background: white;
    color: #666;
    border-color: #ddd;
}

.btn-cancel:hover {
    background: #f5f5f5;
    border-color: #bbb;
    color: #333;
}

.btn-confirm {
    background: #ff9800;
    color: white;
    border-color: #ff9800;
}

.btn-confirm:hover {
    background: #f57c00;
    border-color: #f57c00;
}
</style>