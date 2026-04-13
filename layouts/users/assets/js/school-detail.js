/**
 * School Detail Page JavaScript
 * Handles interactive elements and functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive components
    // initFAQAccordion();
    // initScrollToTop();
    // initSmoothScrolling();
    initHeroStats();
    initImageLazyLoading();
    initImageFallbacks();
    
    console.log('School Detail page initialized');
});

/**
 * Animate number counting
 */
function animateNumber(element) {
    const text = element.textContent;
    const hasPercent = text.includes('%');
    const hasYen = text.includes('¥');
    const hasPlus = text.includes('+');
    const hasDash = text.includes('-');
    
    let number = parseInt(text.replace(/[^0-9]/g, ''));
    if (isNaN(number)) return;
    
    let current = 0;
    const increment = Math.ceil(number / 50);
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= number) {
            current = number;
            clearInterval(timer);
        }
        
        let displayText = current.toLocaleString();
        if (hasYen) displayText += '¥';
        if (hasPercent) displayText += '%';
        if (hasPlus) displayText += '+';
        if (hasDash && text.includes('-')) displayText = text.replace(/\d+/, current);
        
        element.textContent = displayText;
    }, 30);
}

/**
 * Initialize lazy loading for images
 */
function initImageLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

/**
 * Initialize image fallbacks for broken images
 */
function initImageFallbacks() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            // Replace with placeholder if image fails to load
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
            this.alt = 'Không thể tải hình ảnh';
        });
    });
}

/**
 * Animate hero stats on scroll
 */
function initHeroStats() {
    const heroStats = document.querySelectorAll('.school-key-stats .stat-number, .hero-stat-number');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                animateNumber(entry.target);
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    heroStats.forEach(stat => {
        observer.observe(stat);
    });
}