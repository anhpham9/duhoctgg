/**
 * Notifications System - Admin Dashboard
 * Handles notification dropdown, real-time updates, and user interactions
 */

class NotificationsManager {
    constructor() {
        this.notifications = [];
        this.isDropdownOpen = false;
        this.unreadCount = 0;
        
        this.init();
    }

    init() {
        this.loadNotifications();
        this.setupEventListeners();
        this.setupAutoRefresh();
        this.updateBadge();
    }

    loadNotifications() {
        // Simulate loading notifications (in real app, this would be from API)
        this.notifications = [
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
            },
            {
                id: 6,
                type: 'warning',
                title: 'Dung lượng sắp đầy',
                message: 'Dung lượng lưu trữ đã sử dụng 85%',
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
                isRead: true,
                icon: 'fas fa-hdd',
                action: 'storage'
            },
            {
                id: 7,
                type: 'success',
                title: 'Email đã gửi',
                message: 'Thông báo tuyển sinh đã gửi đến 150 sinh viên',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                isRead: true,
                icon: 'fas fa-paper-plane',
                action: 'email'
            }
        ];

        this.updateUnreadCount();
    }

    setupEventListeners() {
        // Notification button click
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header-notifications')) {
                this.closeDropdown();
            }
        });

        // Escape key to close dropdown
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isDropdownOpen) {
                this.closeDropdown();
            }
        });
    }

    setupAutoRefresh() {
        // Refresh notifications every 30 seconds
        setInterval(() => {
            this.refreshNotifications();
        }, 30000);
    }

    toggleDropdown() {
        if (this.isDropdownOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        this.isDropdownOpen = true;
        const dropdown = document.getElementById('notificationsDropdown');
        
        if (dropdown) {
            this.renderNotifications();
            dropdown.style.display = 'block';
            setTimeout(() => {
                dropdown.classList.add('show');
            }, 10);
        }
    }

    closeDropdown() {
        this.isDropdownOpen = false;
        const dropdown = document.getElementById('notificationsDropdown');
        
        if (dropdown) {
            dropdown.classList.remove('show');
            setTimeout(() => {
                dropdown.style.display = 'none';
            }, 300);
        }
    }

    renderNotifications() {
        const container = document.getElementById('notificationsList');
        if (!container) return;

        // Show recent notifications (max 6)
        const recentNotifications = this.notifications.slice(0, 6);
        
        if (recentNotifications.length === 0) {
            container.innerHTML = `
                <div class="notification-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>Không có thông báo nào</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentNotifications.map(notification => `
            <div class="notification-item ${notification.isRead ? 'read' : 'unread'}" data-id="${notification.id}">
                <div class="notification-icon ${notification.type}">
                    <i class="${notification.icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-header">
                        <h4 class="notification-title">${notification.title}</h4>
                        <span class="notification-time">${this.formatTimeAgo(notification.timestamp)}</span>
                    </div>
                    <p class="notification-message">${notification.message}</p>
                </div>
                <div class="notification-actions">
                    ${!notification.isRead ? `
                        <button class="mark-read-btn" onclick="notificationsManager.markAsRead(${notification.id})" title="Đánh dấu đã đọc">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="notification-action-btn" onclick="notificationsManager.handleNotificationClick('${notification.action}')" title="Xem chi tiết">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Update header counts
        this.updateDropdownHeader();
    }

    updateDropdownHeader() {
        const headerCount = document.getElementById('notificationCount');
        const markAllBtn = document.getElementById('markAllReadBtn');
        
        if (headerCount) {
            headerCount.textContent = this.unreadCount;
        }

        if (markAllBtn) {
            markAllBtn.style.display = this.unreadCount > 0 ? 'block' : 'none';
        }
    }

    updateBadge() {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    updateUnreadCount() {
        this.unreadCount = this.notifications.filter(n => !n.isRead).length;
        this.updateBadge();
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
            notification.isRead = true;
            this.updateUnreadCount();
            this.renderNotifications();
            
            // In real app, send API request to mark as read
            this.simulateApiCall('mark-read', { id: notificationId });
        }
    }

    markAllAsRead() {
        const unreadNotifications = this.notifications.filter(n => !n.isRead);
        
        unreadNotifications.forEach(notification => {
            notification.isRead = true;
        });
        
        this.updateUnreadCount();
        this.renderNotifications();
        
        // Show success message
        this.showToast('Đã đánh dấu tất cả thông báo là đã đọc', 'success');
        
        // In real app, send API request
        this.simulateApiCall('mark-all-read');
    }

    handleNotificationClick(action) {
        // Handle different notification actions
        const routes = {
            'maintenance': 'settings-general.html',
            'applications': 'applications.html',
            'contacts': 'contacts.html',
            'backup': 'settings-general.html#backup',
            'news': 'news.html',
            'storage': 'settings-general.html#system',
            'email': 'settings-email.html'
        };

        const url = routes[action] || 'dashboard.html';
        
        this.closeDropdown();
        this.showToast(`Đang chuyển đến ${action}...`, 'info');
        
        // Simulate navigation
        setTimeout(() => {
            // In real app: window.location.href = url;
            console.log(`Navigate to: ${url}`);
        }, 500);
    }

    refreshNotifications() {
        // Simulate receiving new notifications
        const randomChance = Math.random();
        
        if (randomChance < 0.1) { // 10% chance of new notification
            const newNotification = this.generateRandomNotification();
            this.notifications.unshift(newNotification);
            this.updateUnreadCount();
            
            // Show toast for new notification
            this.showToast('Có thông báo mới!', 'info');
            
            // If dropdown is open, refresh the list
            if (this.isDropdownOpen) {
                this.renderNotifications();
            }
        }
    }

    generateRandomNotification() {
        const types = ['info', 'warning', 'success'];
        const notifications = [
            { title: 'Hồ sơ mới', message: 'Có hồ sơ du học mới cần xử lý', icon: 'fas fa-file-alt', action: 'applications' },
            { title: 'Liên hệ mới', message: 'Khách hàng vừa gửi yêu cầu tư vấn', icon: 'fas fa-envelope', action: 'contacts' },
            { title: 'Cập nhật hệ thống', message: 'Phiên bản mới đã sẵn sàng', icon: 'fas fa-sync', action: 'maintenance' }
        ];
        
        const template = notifications[Math.floor(Math.random() * notifications.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        
        return {
            id: Date.now(),
            type: type,
            title: template.title,
            message: template.message,
            timestamp: new Date(),
            isRead: false,
            icon: template.icon,
            action: template.action
        };
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - timestamp) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Vừa xong';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} phút trước`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} giờ trước`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} ngày trước`;
        }
    }

    showToast(message, type = 'info') {
        // Use existing toast system from dashboard.js
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else if (typeof window.DashboardUtils?.showNotification === 'function') {
            window.DashboardUtils.showNotification(message, type);
        }
    }

    simulateApiCall(action, data = {}) {
        // Simulate API call delay
        console.log(`API Call: ${action}`, data);
        return new Promise(resolve => setTimeout(resolve, 500));
    }

    // Public methods
    addNotification(notification) {
        const newNotification = {
            id: Date.now(),
            timestamp: new Date(),
            isRead: false,
            ...notification
        };
        
        this.notifications.unshift(newNotification);
        this.updateUnreadCount();
        
        if (this.isDropdownOpen) {
            this.renderNotifications();
        }
        
        return newNotification;
    }

    removeNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateUnreadCount();
        
        if (this.isDropdownOpen) {
            this.renderNotifications();
        }
    }

    clearAllNotifications() {
        this.notifications = [];
        this.updateUnreadCount();
        
        if (this.isDropdownOpen) {
            this.renderNotifications();
        }
        
        this.showToast('Đã xóa tất cả thông báo', 'success');
    }
}

// Initialize notifications manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.notificationsManager = new NotificationsManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationsManager;
}