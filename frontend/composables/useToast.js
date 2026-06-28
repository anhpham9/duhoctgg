// ========================================
// TOAST COMPOSABLE - Global Toast System
// ========================================

export const useToast = () => {
    
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
        }, 30000)
    }

    // Convenience methods
    const showSuccess = (message) => showToast(message, 'success')
    const showError = (message) => showToast(message, 'error')
    const showWarning = (message) => showToast(message, 'warning')
    const showInfo = (message) => showToast(message, 'info')

    return {
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo
    }
}