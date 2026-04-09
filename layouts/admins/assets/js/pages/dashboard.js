/**
 * Dashboard JavaScript - Chỉ dành cho dashboard.html
 * Xử lý các elements thực sự tồn tại trong dashboard.html
 */

document.addEventListener('DOMContentLoaded', function () {


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
    // UTILITIES (Using Common.js)
    // ========================================

    // Use common utilities from common.js
    const formatNumber = CommonUtils?.formatNumber || ((num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    });

    const showLoadingSpinner = () => {
        if (CommonUtils?.showLoadingSpinner) {
            CommonUtils.showLoadingSpinner();
        } else {
            console.warn('CommonUtils not available - Loading spinner disabled');
        }
    };

    const hideLoadingSpinner = () => {
        if (CommonUtils?.hideLoadingSpinner) {
            CommonUtils.hideLoadingSpinner();
        } else {
            console.warn('CommonUtils not available - Loading spinner disabled');
        }
    };

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
            if (window.notificationsManager) {
                window.notificationsManager.showToast('Lỗi khi tải dữ liệu dashboard', 'error');
            }
        } finally {
            hideLoadingSpinner();
        }
    };

    // ========================================
    // INITIALIZATION
    // ========================================
    console.log('Dashboard initialized - optimized for dashboard.html');

    // Uncomment to load data on startup
    loadDashboardData();

    // Export functions globally if needed
    window.DashboardController = {
        formatNumber,
        showLoadingSpinner,
        hideLoadingSpinner,
        loadDashboardData
    };

});