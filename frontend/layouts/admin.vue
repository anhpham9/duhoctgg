<template>
    <div class="admin-layout">
        <!-- Sidebar Component -->
        <AdminSidebar />

        <!-- Main Content Area -->
        <div class="content">
            <!-- Main Content -->
            <main class="main-content">
                <!-- Header Component -->
                <AdminHeader ref="headerRef" />

                <!-- Page Content Container -->
                <div class="content-container">
                    <slot />
                </div>
            </main>
        </div>

        <!-- Mobile Overlay -->
        <div class="mobile-overlay" id="mobileOverlay" @click="handleMobileOverlayClick"></div>

        <!-- Global Toast Container -->
        <div id="toast-container"></div>
    </div>
</template>

<script setup>


import "~/assets/css/admin/style.css";
import "~/assets/css/admin/responsive.css";
// ========================================
// ADMIN LAYOUT - MAIN ORCHESTRATOR
// ========================================

// Template refs
const headerRef = ref(null)
const route = useRoute()

// Watch for route changes to ensure proper layout
watch(() => route.path, () => {
    if (process.client) {
        nextTick(() => {
            // Force layout recalculation after route change
            window.dispatchEvent(new Event('resize'))
        })
    }
})

// ========================================
// GLOBAL TOAST SYSTEM
// ========================================

const showToast = (message, type = 'info') => {
    // Create toast notification
    const toast = document.createElement('div')
    toast.className = `toast-notification ${type}`
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${getToastIcon(type)}"></i>
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `
    
    // Style the toast
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 350px;
        padding: 12px;
        border-radius: 6px;
        color: white;
        font-size: 14px;
        z-index: 9999;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        cursor: pointer;
    `
    
    // Set background color based on type
    const colors = {
        'success': '#28a745',
        'warning': '#ffc107',
        'danger': '#dc3545',
        'error': '#dc3545',
        'info': '#007bff'
    }
    
    toast.style.backgroundColor = colors[type] || colors.info
    
    if (type === 'warning') {
        toast.style.color = '#e90000'
    }
    
    // Find or create toast container
    let container = document.getElementById('toast-container')
    if (!container) {
        container = document.createElement('div')
        container.id = 'toast-container'
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
        `
        document.body.appendChild(container)
    }
    
    container.appendChild(toast)
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1'
        toast.style.transform = 'translateX(0)'
    }, 100)
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0'
        toast.style.transform = 'translateX(100%)'
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove()
            }
        }, 300)
    }, 3000)
}

const getToastIcon = (type) => {
    const icons = {
        'success': 'circle-check',
        'warning': 'triangle-exclamation',
        'danger': 'circle-exclamation',
        'error': 'circle-xmark',
        'info': 'circle-info'
    }
    return icons[type] || 'bell'
}

// ========================================
// GLOBAL NOTIFICATION API
// ========================================

const addNotification = (message, type = 'info', title = 'Thﾃｴng bﾃ｡o m盻嬖') => {
    // Delegate to header component
    if (headerRef.value?.addNotification) {
        headerRef.value.addNotification(message, type, title)
    }
}
// ========================================
// MOBILE SIDEBAR CONTROLS
// ========================================

const handleMobileOverlayClick = () => {
    // Use global sidebar controls if available
    if (process.client && window.sidebarControls?.closeMobileSidebar) {
        window.sidebarControls.closeMobileSidebar()
    }
}
// ========================================
// LIFECYCLE & GLOBAL SETUP
// ========================================

onMounted(() => {
    // Reset body styles for admin layout
    if (process.client) {
        // Clear login styles and set admin styles
        document.body.style.background = '#f5f5f5'
        // document.body.style.overflow = ''
        document.body.style.overflowX = 'hidden'
        document.body.style.overflowY = 'auto'
        // document.body.style.position = ''
        document.body.style.display = 'flex'
        
        // Force layout recalculation
        nextTick(() => {
            window.dispatchEvent(new Event('resize'))
        })
    }
    
    // Make toast system globally available
    if (process.client) {
        window.showToast = showToast
        
        // Make notification system globally available for testing
        window.notificationsManager = {
            showToast,
            addNotification,
            markAllAsRead: () => headerRef.value?.markAllAsRead(),
            getUnreadCount: () => headerRef.value?.unreadCount || 0
        }
        
        // Compatibility with old notification API
        window.NotificationAnimations = {
            addNotification,
            showToast,
            triggerWithEffects: (message, type = 'info') => {
                addNotification(message, type)
            }
        }
        
        // Force layout recalculation
        nextTick(() => {
            window.dispatchEvent(new Event('resize'))
        })
    }
})
// Cleanup on unmount
onBeforeUnmount(() => {
    if (process.client) {
        // Reset body styles to clean state for next layout
        document.body.style.background = ''
        document.body.style.overflow = ''
        document.body.style.overflowX = ''
        document.body.style.overflowY = ''
        document.body.style.position = ''
        document.body.style.display = ''
        document.body.style.minHeight = ''
    }
})
// ========================================
// EXPOSE FUNCTIONS
// ========================================

defineExpose({
    showToast,
    addNotification
})
</script>

<style scoped>


/* Sidebar open state for mobile */
:global(body.sidebar-open) .mobile-overlay {
    display: block;
}

:global(body.sidebar-open) .sidebar {
    transform: translateX(0);
}
</style>
