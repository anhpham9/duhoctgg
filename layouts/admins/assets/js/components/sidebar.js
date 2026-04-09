/**
 * Sidebar JavaScript - Chỉ dành cho sidebar, không chứa các phần tử khác
 * Xử lý các elements thực sự tồn tại trong sidebar
 */

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
            // Ngăn scroll trang khi sidebar mobile mở
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Close mobile sidebar
    function closeMobileSidebar() {
        sidebar.classList.remove('active');
        mobileOverlay.classList.remove('active');
        // Khôi phục scroll trang khi sidebar đóng
        document.body.style.overflow = '';
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
    // RESPONSIVE HANDLING
    // ========================================
    function handleResponsive() {
        const isMobile = window.innerWidth <= 768;
        
        // Nếu chuyển từ mobile sang desktop và sidebar đang active, đóng sidebar
        if (!isMobile && sidebar?.classList.contains('active')) {
            closeMobileSidebar();
        }
    }

    // Listen for window resize
    window.addEventListener('resize', handleResponsive);

});