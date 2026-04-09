/**
 * Dashboard01 JavaScript - Chỉ dành cho dashboard01.html
 * Xử lý các elements thực sự tồn tại trong dashboard01.html
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // SIDEBAR FUNCTIONALITY
    // ========================================
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            if (mobileOverlay) {
                mobileOverlay.classList.toggle('active');
            }
        });
    }

    // Đóng sidebar khi click overlay (mobile)
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            mobileOverlay.classList.remove('active');
        });
    }

    // ========================================
    // USER DROPDOWN FUNCTIONALITY
    // ========================================
    const userDropdownToggle = document.getElementById('userDropdownToggle');
    const userDropdown = document.getElementById('userDropdown');

    if (userDropdownToggle && userDropdown) {
        userDropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            userDropdown.classList.toggle('show');
        });

        // Đóng dropdown khi click bên ngoài
        document.addEventListener('click', function(e) {
            if (!userDropdownToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }

    // ========================================
    // NOTIFICATIONS FUNCTIONALITY
    // ========================================
    const notificationToggle = document.getElementById('notificationToggle');
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    const notificationsList = document.getElementById('notificationsList');
    const notificationCount = document.getElementById('notificationCount');
    const markAllReadBtn = document.getElementById('markAllReadBtn');

    // Toggle notification dropdown
    if (notificationToggle && notificationsDropdown) {
        notificationToggle.addEventListener('click', function(e) {
            e.preventDefault();
            notificationsDropdown.classList.toggle('show');
        });

        // Đóng notification dropdown khi click bên ngoài
        document.addEventListener('click', function(e) {
            if (!notificationToggle.contains(e.target) && !notificationsDropdown.contains(e.target)) {
                notificationsDropdown.classList.remove('show');
            }
        });
    }

    // Mark all notifications as read
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', function() {
            // Xóa badge count
            if (notificationCount) {
                notificationCount.textContent = '0';
                notificationCount.style.display = 'none';
            }

            // Đánh dấu tất cả notification items đã đọc
            const notificationItems = notificationsList?.querySelectorAll('.notification-item');
            if (notificationItems) {
                notificationItems.forEach(item => {
                    item.classList.add('read');
                });
            }

            // Đóng dropdown
            if (notificationsDropdown) {
                notificationsDropdown.classList.remove('show');
            }

            console.log('All notifications marked as read');
        });
    }

    // ========================================
    // LOGOUT FUNCTIONALITY
    // ========================================
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                window.location.href = 'login.html';
            }
        });
    }

    // ========================================
    // NOTIFICATIONS MANAGER (Global Object)
    // ========================================
    const notificationsManager = {
        markAllAsRead: function() {
            if (notificationCount) {
                notificationCount.textContent = '0';
                notificationCount.style.display = 'none';
            }
            
            const notificationItems = notificationsList?.querySelectorAll('.notification-item');
            if (notificationItems) {
                notificationItems.forEach(item => {
                    item.classList.add('read');
                });
            }
            
            console.log('All notifications marked as read via manager');
        },

        addNotification: function(message, type = 'info') {
            if (!notificationsList) return;

            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${type}`;
            notificationItem.innerHTML = `
                <div class="notification-content">
                    <span class="notification-message">${message}</span>
                    <span class="notification-time">Vừa xong</span>
                </div>
            `;

            notificationsList.insertBefore(notificationItem, notificationsList.firstChild);
            
            // Cập nhật count
            if (notificationCount) {
                let count = parseInt(notificationCount.textContent) || 0;
                count++;
                notificationCount.textContent = count;
                notificationCount.style.display = 'inline-block';
            }
        },

        getUnreadCount: function() {
            if (!notificationCount) return 0;
            return parseInt(notificationCount.textContent) || 0;
        }
    };

    // Làm notificationsManager có sẵn globally (được tham chiếu trong HTML)
    window.notificationsManager = notificationsManager;

    // ========================================
    // DASHBOARD ANIMATIONS
    // ========================================
    
    // Stats loading animation
    setTimeout(() => {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 500);

    // ========================================
    // LOADING SPINNER
    // ========================================
    const showLoadingSpinner = () => {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
            </div>
        `;
        document.body.appendChild(spinner);
    };

    const hideLoadingSpinner = () => {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    };

    // ========================================
    // UTILITIES
    // ========================================
    
    // Format numbers với comma
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Simple notification toast
    function showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `notification-toast ${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        // Set background color based on type
        switch(type) {
            case 'success':
                toast.style.backgroundColor = '#28a745';
                break;
            case 'error':
                toast.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                toast.style.backgroundColor = '#ffc107';
                toast.style.color = '#212529';
                break;
            default:
                toast.style.backgroundColor = '#007bff';
        }
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }

    // ========================================
    // DASHBOARD DATA LOADING
    // ========================================
    const loadDashboardData = async () => {
        showLoadingSpinner();
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Update dashboard stats
            console.log('Dashboard data loaded successfully');
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            showNotification('Lỗi khi tải dữ liệu dashboard', 'error');
        } finally {
            hideLoadingSpinner();
        }
    };

    // ========================================
    // RESPONSIVE HANDLING
    // ========================================
    function handleResponsive() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile && sidebar?.classList.contains('active')) {
            // Trên mobile, sidebar sẽ overlay
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    // Listen for window resize
    window.addEventListener('resize', handleResponsive);
    
    // Initial responsive check
    handleResponsive();

    // ========================================
    // INITIALIZATION
    // ========================================
    console.log('Dashboard01 initialized - optimized for dashboard01.html');
    
    // Uncomment to load data on startup
    // loadDashboardData();

    // Export functions globally if needed
    window.DashboardController = {
        showNotification,
        formatNumber,
        showLoadingSpinner,
        hideLoadingSpinner,
        loadDashboardData
    };

});