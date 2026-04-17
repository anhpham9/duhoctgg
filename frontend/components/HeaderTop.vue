<template>
    <div ref="headerTop" class="header-top" :class="{ hidden: isHidden }">
        <div class="container">
            <div class="header-top-content">
                <div class="social-icons-top">
                    <a href="#" class="social-icon"><i class="fab fa-facebook"></i></a>
                    <a href="#" class="social-icon"><i class="fab fa-tiktok"></i></a>
                    <a href="#" class="social-icon"><i class="fab fa-youtube"></i></a>
                    <a href="#" class="social-icon"><i class="fab fa-instagram"></i></a>
                </div>
                <div class="contact-info-top">
                    <div class="email-info">
                        <i class="fas fa-envelope"></i>
                        <span>info@duhocnb.com</span>
                    </div>
                    <div class="hotline-info">
                        <i class="fas fa-phone"></i>
                        <span class="hotline-label">Hotline: </span><span>+84 123 456 789</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const headerTop = ref(null)
const isHidden = ref(false)
let lastScrollTop = 0
let ticking = false

const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    // Hide/show header-top on scroll
    if (scrollTop > 80) {
        if (scrollTop > lastScrollTop && scrollTop > 150) {
            // Scrolling down past threshold
            isHidden.value = true
        } else if (scrollTop < lastScrollTop) {
            // Scrolling up
            isHidden.value = false
        }
    } else {
        // At top of page
        isHidden.value = false
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop
    ticking = false
}

const requestTick = () => {
    if (!ticking) {
        requestAnimationFrame(handleScroll)
        ticking = true
    }
}

onMounted(() => {
    window.addEventListener('scroll', requestTick, { passive: true })
})

onBeforeUnmount(() => {
    window.removeEventListener('scroll', requestTick)
})
</script>

<style scoped>
/* Header Top */
.header-top {
    background: #b71c1c;
    color: white;
    padding: 10px 0;
    font-size: 14px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1001;
    height: 40px;
}

.header-top.hidden {
    transform: translateY(-100%);
}

.header-top-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.social-icons-top {
    display: flex;
    gap: 15px;
}

.social-icon {
    color: white;
    font-size: 16px;
    transition: all 0.3s ease;
    text-decoration: none;
}

.social-icon:hover {
    color: #ffeb3b;
    transform: translateY(-2px);
}

.contact-info-top {
    display: flex;
    gap: 30px;
    align-items: center;
}

.email-info,
.hotline-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.email-info i,
.hotline-info i {
    font-size: 14px;
}

@media (max-width: 1024px) {

    /* Header Top */
    .header-top {
        font-size: 13px;
    }
}

@media (max-width: 768px) {

    /* Header Top */
    .header-top {
        padding: 8px 0;
        font-size: 12px;
    }

    .social-icons-top {
        gap: 12px;
    }

    .social-icon {
        font-size: 14px;
    }

    .contact-info-top {
        gap: 0;
    }

    .email-info {
        display: none;
    }

    .hotline-label {
        display: none;
    }
}

@media (max-width: 480px) {

    /* Header Top */
    .header-top {
        padding: 6px 0;
        font-size: 11px;
    }

    .social-icons-top {
        gap: 8px;
    }

    .social-icon {
        font-size: 13px;
    }

    .hotline-info span {
        font-size: 11px;
    }
}

@media (max-width: 768px) and (orientation: landscape) {
    .header-top {
        padding: 5px 0;
    }
}
</style>