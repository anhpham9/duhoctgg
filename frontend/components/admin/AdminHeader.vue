<template>
    <header class="main-header">
        <div class="header-left">
            <button class="sidebar-toggle mobile-toggle" @click="handleMobileToggle">
                <i class="fas fa-bars"></i>
            </button>

            <div class="breadcrumb">
                <span class="breadcrumb-item">Trang chủ</span>
                <i class="fas fa-chevron-right"></i>
                <span class="breadcrumb-item active">{{ currentPageTitle }}</span>
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
                            @click="markAllAsRead"
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
                                        v-if="!notification.isRead"
                                        class="mark-read-btn" 
                                        @click="markAsRead(notification.id)"
                                        title="Đánh dấu đã đọc"
                                    >
                                        <i class="fas fa-check"></i>
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
                        <NuxtLink to="/admin/notifications" class="view-all-link">
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
                        <NuxtLink to="/admin/profile"><i class="fas fa-user"></i> Hồ sơ</NuxtLink>
                        <hr>
                        <button @click="handleLogout" class="logout-btn">
                            <i class="fas fa-sign-out-alt"></i> Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup>
import "~/assets/css/admin/notifications.css";
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

// Template refs
const notificationBtn = ref(null)
const notificationsDropdown = ref(null)

// ========================================
// COMPUTED PROPERTIES
// ========================================

const currentPageTitle = computed(() => {
    const pageTitles = {
        '/admin': 'Dashboard',
        '/admin/users': 'Người dùng',
        '/admin/contacts': 'Liên hệ',
        '/admin/schools': 'Trường học',
        '/admin/news': 'Tin tức',
        '/admin/settings': 'Cài đặt'
    }
    
    // Find matching page or default to Dashboard
    const match = Object.keys(pageTitles).find(path => route.path.startsWith(path))
    return pageTitles[match] || 'Dashboard'
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
    const icons = {
        'success': 'fas fa-check-circle',
        'warning': 'fas fa-exclamation-triangle',
        'danger': 'fas fa-exclamation-circle',
        'info': 'fas fa-info-circle'
    }
    return icons[type] || 'fas fa-bell'
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
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-notifications')) {
            closeDropdown()
        }
        if (!e.target.closest('.header-profile')) {
            isProfileMenuOpen.value = false
        }
    })
    
    // Escape key to close dropdowns
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDropdown()
            isProfileMenuOpen.value = false
        }
    })
    
    // Make notification system globally available
    if (process.client) {
        window.headerNotifications = {
            addNotification,
            markAllAsRead,
            getUnreadCount: () => unreadCount.value
        }
    }
    
    // Auto-refresh
    const refreshInterval = setInterval(() => {
        loadNotifications()
    }, 30000) // 30 seconds

    onBeforeUnmount(() => {
        clearInterval(refreshInterval)
    })
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
</style>