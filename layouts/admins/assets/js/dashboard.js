/**
 * Dashboard JavaScript - Reusable Components
 * Handles sidebar, mobile menu, dropdowns, and dashboard interactions
 */

// ========================================
// UTILITY FUNCTIONS (Global Scope)
// ========================================

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingToast = document.querySelector('.notification-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new notification
    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: #666; cursor: pointer; margin-left: auto;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Show notification
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        case 'info': default: return 'info-circle';
    }
}

// Format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Export functions for use in other pages
window.DashboardUtils = {
    showNotification,
    formatNumber,
    debounce,
    isInViewport
};

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // SIDEBAR FUNCTIONALITY
    // ========================================
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    // Sidebar toggle - Handle both desktop and mobile
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                // Mobile behavior: close sidebar
                closeMobileSidebar();
            } else {
                // Desktop behavior: toggle collapsed state
                sidebar.classList.toggle('collapsed');
            }
        });
    }
    
    // Mobile sidebar toggle (hamburger menu)
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.add('active');
            mobileOverlay.classList.add('active');
        });
    }
    
    // Close mobile sidebar
    function closeMobileSidebar() {
        sidebar.classList.remove('active');
        mobileOverlay.classList.remove('active');
    }
    
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMobileSidebar);
    }
    
    // ========================================
    // SUBMENU FUNCTIONALITY
    // ========================================
    const submenuItems = document.querySelectorAll('.has-submenu');
    
    submenuItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        link.addEventListener('click', function(e) {
            e.preventDefault();
            item.classList.toggle('active');
            
            // Close other submenus
            submenuItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
        });
    });
    
    // ========================================
    // PROFILE DROPDOWN
    // ========================================
    const profileDropdown = document.querySelector('.profile-dropdown');
    const profileBtn = document.querySelector('.profile-btn');
    const profileMenu = document.querySelector('.profile-menu');
    
    if (profileBtn && profileMenu) {
        // Toggle dropdown on click (both desktop and mobile)
        profileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle menu visibility
            const isVisible = profileMenu.style.opacity === '1' || 
                            profileMenu.classList.contains('show');
            
            if (isVisible) {
                // Hide menu
                profileMenu.style.opacity = '0';
                profileMenu.style.visibility = 'hidden';
                profileMenu.style.transform = 'translateY(-10px)';
                profileMenu.classList.remove('show');
            } else {
                // Show menu
                profileMenu.style.opacity = '1';
                profileMenu.style.visibility = 'visible';
                profileMenu.style.transform = 'translateY(0)';
                profileMenu.classList.add('show');
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!profileDropdown.contains(e.target)) {
                profileMenu.style.opacity = '0';
                profileMenu.style.visibility = 'hidden';
                profileMenu.style.transform = 'translateY(-10px)';
                profileMenu.classList.remove('show');
            }
        });
        
        // Close dropdown when pressing Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                profileMenu.style.opacity = '0';
                profileMenu.style.visibility = 'hidden';
                profileMenu.style.transform = 'translateY(-10px)';
                profileMenu.classList.remove('show');
            }
        });
    }
    
    // ========================================
    // CHART INTERACTIONS
    // ========================================
    const chartBars = document.querySelectorAll('.chart-bar');
    
    chartBars.forEach(bar => {
        bar.addEventListener('mouseenter', function() {
            // Add hover effect for better visibility
            this.style.filter = 'brightness(1.1)';
        });
        
        bar.addEventListener('mouseleave', function() {
            this.style.filter = 'brightness(1)';
        });
        
        bar.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            showNotification(`Giá trị: ${value} đăng ký`, 'info');
        });
    });
    
    // ========================================
    // SEARCH FUNCTIONALITY
    // ========================================
    const searchInput = document.querySelector('.search-box input');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.trim();
                if (searchTerm) {
                    showNotification(`Tìm kiếm: "${searchTerm}"`, 'info');
                    // Here you would implement actual search functionality
                }
            }
        });
    }
    
    // ========================================
    // RESPONSIVE HANDLING
    // ========================================
    function handleResize() {
        const width = window.innerWidth;
        
        // Close mobile sidebar when switching to desktop
        if (width > 768) {
            sidebar.classList.remove('active');
            mobileOverlay.classList.remove('active');
        }
        
        // Reset profile menu on resize
        if (profileMenu) {
            profileMenu.style.opacity = '0';
            profileMenu.style.visibility = 'hidden';
            profileMenu.style.transform = 'translateY(-10px)';
            profileMenu.classList.remove('show');
        }
    }
    
    window.addEventListener('resize', handleResize);
    
    // ========================================
    // QUICK ACTIONS
    // ========================================
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.querySelector('span').textContent;
            showNotification(`Đang chuyển đến: ${action}`, 'info');
            
            // Simulate navigation delay
            setTimeout(() => {
                // In a real application, you would navigate to the actual page
                // window.location.href = this.href;
            }, 1000);
        });
    });
    
    // ========================================
    // STATS ANIMATION
    // ========================================
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const finalValue = stat.textContent;
            const numericValue = parseFloat(finalValue.replace(/[^\d.]/g, ''));
            const isPercentage = finalValue.includes('%');
            
            if (!isNaN(numericValue)) {
                let current = 0;
                const increment = numericValue / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= numericValue) {
                        current = numericValue;
                        clearInterval(timer);
                    }
                    
                    let displayValue = Math.floor(current);
                    if (isPercentage) {
                        displayValue += '%';
                    } else if (numericValue >= 1000) {
                        displayValue = displayValue.toLocaleString();
                    }
                    
                    stat.textContent = displayValue;
                }, 20);
            }
        });
    }
    
    // ========================================
    // INTERSECTION OBSERVER FOR ANIMATIONS
    // ========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('stats-grid')) {
                    animateStats();
                }
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.stats-grid, .dashboard-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // ========================================
    // ACTIVITY LIST AUTO-REFRESH
    // ========================================
    function refreshActivityList() {
        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            // Add loading state
            activityList.style.opacity = '0.6';
            
            // Simulate API call
            setTimeout(() => {
                activityList.style.opacity = '1';
                showNotification('Danh sách hoạt động đã được cập nhật', 'success');
            }, 1000);
        }
    }
    
    // Auto-refresh every 5 minutes
    setInterval(refreshActivityList, 300000);
    
    // ========================================
    // KEYBOARD SHORTCUTS
    // ========================================
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K for search focus
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Escape to close mobile sidebar
        if (e.key === 'Escape') {
            closeMobileSidebar();
        }
    });
    
    // ========================================
    // INITIALIZATION COMPLETE
    // ========================================
    console.log('Dashboard initialized successfully');
    // showNotification('Dashboard đã sẵn sàng!', 'success');
    
    // Hide loading spinner if exists
    const loadingSpinner = document.querySelector('.loading-spinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
});