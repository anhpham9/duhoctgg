// Notification System Composable
export const useNotification = () => {
    const showNotification = (message, type = 'info') => {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification')
        if (existingNotification) {
            existingNotification.remove()
        }
        
        // Create notification element
        const notification = document.createElement('div')
        notification.className = `notification notification-${type}`
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `
        
        // Add to body
        document.body.appendChild(notification)
        
        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close')
        closeBtn.addEventListener('click', () => {
            notification.remove()
        })
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove()
            }
        }, 5000)
    }

    const showSuccess = (message) => {
        showNotification(message, 'success')
    }

    const showError = (message) => {
        showNotification(message, 'error')
    }

    const showInfo = (message) => {
        showNotification(message, 'info')
    }

    return {
        showNotification,
        showSuccess,
        showError,
        showInfo
    }
}