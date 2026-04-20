// ========================================
// NOTIFICATION COMPOSABLE 
// ========================================
// Centralized notification system

import { reactive, ref, readonly } from 'vue'

export const useNotifications = () => {
    // Global notification state
    const notification = reactive({
        show: false,
        type: 'success', // success, error, warning, info
        message: '',
        icon: 'fas fa-check-circle'
    })

    // Auto hide timeout reference
    let hideTimeout = null

    // Show notification with type and message
    const showNotification = (type, message, duration = 5000) => {
        // Clear existing timeout
        if (hideTimeout) {
            clearTimeout(hideTimeout)
        }

        // Set notification data
        notification.type = type
        notification.message = message
        notification.icon = getIconForType(type)
        notification.show = true

        // Auto hide after duration
        if (duration > 0) {
            hideTimeout = setTimeout(() => {
                hideNotification()
            }, duration)
        }
    }

    // Hide notification
    const hideNotification = () => {
        notification.show = false
        
        // Clear timeout if exists
        if (hideTimeout) {
            clearTimeout(hideTimeout)
            hideTimeout = null
        }
    }

    // Get icon class for notification type
    const getIconForType = (type) => {
        switch (type) {
            case 'success':
                return 'fas fa-check-circle'
            case 'error':
                return 'fas fa-exclamation-circle'
            case 'warning':
                return 'fas fa-exclamation-triangle'
            case 'info':
                return 'fas fa-info-circle'
            default:
                return 'fas fa-check-circle'
        }
    }

    // Convenience methods for different types
    const showSuccess = (message, duration = 5000) => {
        showNotification('success', message, duration)
    }

    const showError = (message, duration = 8000) => {
        showNotification('error', message, duration)
    }

    const showWarning = (message, duration = 6000) => {
        showNotification('warning', message, duration)
    }

    const showInfo = (message, duration = 5000) => {
        showNotification('info', message, duration)
    }

    // Show loading notification (no auto hide)
    const showLoading = (message = 'Đang xử lý...') => {
        showNotification('info', message, 0) // 0 = no auto hide
    }

    return {
        // State
        notification: readonly(notification),
        
        // Methods
        showNotification,
        hideNotification,
        showSuccess,
        showError,
        showWarning, 
        showInfo,
        showLoading
    }
}