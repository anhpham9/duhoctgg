<template>
    <div>
        <!-- Header Top -->
        <HeaderTop />

        <!-- Header -->
        <Header />

        <main>
            <slot />
        </main>

        <!-- Contact Section -->
        <ContactForm />

        <!-- Global Toast Notifications -->
        <Toast />

        <!-- Global popup campaigns -->
        <ClientOnly>
            <PopupCampaign />
        </ClientOnly>

        <!-- Footer -->
        <Footer />

        <!-- Back to Top Button -->
        <Transition name="fade">
            <button v-show="showBackToTop" @click="scrollToTop" class="back-to-top" :style="backToTopStyle">
                <i class="fas fa-arrow-up"></i>
            </button>
        </Transition>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useScrollAnimation } from '~/composables/useScrollAnimation'

// Import CSS
import "~/assets/css/style.css";
import "~/assets/css/responsive.css";

// Composables
const { animateOnScroll, observeElements } = useScrollAnimation()

// Back to top functionality
const showBackToTop = ref(false)
const backToTopStyle = {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '50px',
    height: '50px',
    background: '#d32f2f',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    zIndex: '1000',
    transition: 'all 0.3s ease',
    boxShadow: '0 5px 15px rgba(211, 47, 47, 0.4)'
}

let scrollObserver = null

// Scroll handling
const handleScroll = () => {
    const scrollY = window.scrollY
    showBackToTop.value = scrollY > 300

    // Animate elements on scroll (fallback for older browsers)
    if (!window.IntersectionObserver) {
        animateOnScroll()
    }
}

// Smooth scroll to top
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}

// Lifecycle hooks
onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Setup scroll animations with Intersection Observer
    if (window.IntersectionObserver) {
        scrollObserver = observeElements()
    } else {
        // Fallback for older browsers
        animateOnScroll()
    }

    // Add CSS animations
    const style = document.createElement('style')
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .fade-enter-active, .fade-leave-active {
            transition: opacity 0.3s ease;
        }
        .fade-enter-from, .fade-leave-to {
            opacity: 0;
        }
        
        .back-to-top:hover {
            background: #b71c1c !important;
            transform: translateY(-2px) !important;
        }
    `
    document.head.appendChild(style)
})

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
    if (scrollObserver) {
        scrollObserver.disconnect()
    }
})
</script>