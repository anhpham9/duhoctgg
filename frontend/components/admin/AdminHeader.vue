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
                                        @click="handleNotificationClick(notification.action)"
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
                        <span class="profile-name">Admin</span>
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

const loadNotifications = () => {
    // Simulate loading notifications (in real app, this would be from API)
    notifications.value = [
        {
            id: 1,
            type: 'danger',
            title: 'Bảo trì hệ thống',
            message: 'Hệ thống sẽ bảo trì vào 2:00 sáng ngày mai',
            timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
            isRead: false,
            icon: 'fas fa-exclamation-triangle',
            action: 'maintenance'
        },
        {
            id: 2,
            type: 'warning',
            title: 'Hồ sơ mới cần duyệt',
            message: 'Có 5 hồ sơ du học mới chờ duyệt',
            timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
            isRead: false,
            icon: 'fas fa-file-alt',
            action: 'applications'
        },
        {
            id: 3,
            type: 'info',
            title: 'Liên hệ mới',
            message: 'Nguyễn Văn A đã gửi yêu cầu tư vấn',
            timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
            isRead: false,
            icon: 'fas fa-envelope',
            action: 'contacts'
        },
        {
            id: 4,
            type: 'success',
            title: 'Backup thành công',
            message: 'Sao lưu dữ liệu hoàn tất lúc 14:00',
            timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
            isRead: true,
            icon: 'fas fa-check-circle',
            action: 'backup'
        },
        {
            id: 5,
            type: 'info',
            title: 'Cập nhật tin tức',
            message: 'Bài viết "Học bổng MEXT 2026" đã được xuất bản',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            isRead: true,
            icon: 'fas fa-newspaper',
            action: 'news'
        }
    ]
    updateUnreadCount()
}

const updateUnreadCount = () => {
    unreadCount.value = notifications.value.filter(n => !n.isRead).length
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

const markAsRead = (notificationId) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification && !notification.isRead) {
        notification.isRead = true
        updateUnreadCount()
        
        // In real app, send API request to mark as read
        simulateApiCall('mark-read', { id: notificationId })
    }
}

const markAllAsRead = () => {
    const unreadNotifications = notifications.value.filter(n => !n.isRead)
    
    unreadNotifications.forEach(notification => {
        notification.isRead = true
    })
    
    updateUnreadCount()
    
    // Show success message using global toast function
    if (window.showToast) {
        window.showToast('Đã đánh dấu tất cả thông báo là đã đọc', 'success')
    }
    
    // In real app, send API request
    simulateApiCall('mark-all-read')
}

const handleNotificationClick = (action) => {
    // Handle different notification actions
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

    const route = routes[action] || '/admin'
    
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
            
            // Even if API fails, still redirect to login
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

const addNotification = (message, type = 'info', title = 'Thông báo mới') => {
    const newNotification = {
        id: Date.now(),
        type: type,
        title: title,
        message: message,
        timestamp: new Date(),
        isRead: false,
        icon: getIconByType(type),
        action: 'dashboard'
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

onMounted(() => {
    loadNotifications()
    
    // Close dropdowns when clicking outside
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
})

// ========================================
// EXPOSE FOR EXTERNAL ACCESS  
// ========================================

defineExpose({
    addNotification,
    markAllAsRead,
    unreadCount: readonly(unreadCount)
})
</script>

<style scoped>
.profile-menu.show {
    display: block;
}

.profile-menu {
    display: none;
}
</style>