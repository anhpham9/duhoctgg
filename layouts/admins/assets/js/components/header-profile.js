/**
 * Header Profile JavaScript - Reusable Components
 * Handles header profile dropdown, header profile interactions
 */ 

document.addEventListener('DOMContentLoaded', function() {

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

});