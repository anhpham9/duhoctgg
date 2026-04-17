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
        <section id="contact" class="contact full-section">
            <div class="container">
                <div class="ft-form-inner full-section">
                    <div class="ft-form-inner1">
                        <div class="section-header">
                            <h2>Liên Hệ Tư Vấn</h2>
                            <p>Để lại thông tin để được tư vấn miễn phí</p>
                        </div>
                        <div class="contact-content">
                            <form ref="contactForm" class="contact-form" @submit.prevent="handleSubmit">
                                <div class="form-group">
                                    <input 
                                        ref="nameInput"
                                        type="text" 
                                        placeholder="Họ và tên *" 
                                        v-model="formData.name"
                                        required
                                    >
                                </div>
                                <div class="form-group">
                                    <input 
                                        ref="emailInput"
                                        type="email" 
                                        placeholder="Email *" 
                                        v-model="formData.email"
                                        required
                                    >
                                </div>
                                <div class="form-group">
                                    <input 
                                        ref="phoneInput"
                                        type="tel" 
                                        placeholder="Số điện thoại *" 
                                        v-model="formData.phone"
                                        required
                                    >
                                </div>
                                <div class="form-group">
                                    <input 
                                        type="text" 
                                        placeholder="Lời nhắn..."
                                        v-model="formData.message"
                                    >
                                </div>
                                <button type="submit" class="btn btn-primary">Gửi tin nhắn</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>Du Học NB</h3>
                        <p>Đồng hành cùng bạn trên hành trình chinh phục ước mơ du học.</p>
                        <div class="social-links">
                            <a href="#"><i class="fab fa-facebook"></i></a>
                            <a href="#"><i class="fab fa-tiktok"></i></a>
                            <a href="#"><i class="fab fa-youtube"></i></a>
                            <a href="#"><i class="fab fa-instagram"></i></a>
                        </div>
                    </div>
                    <div class="footer-section">
                        <h4>Dịch vụ</h4>
                        <ul>
                            <li><a href="#">Tư vấn chọn trường</a></li>
                            <li><a href="#">Hỗ trợ hồ sơ</a></li>
                            <li><a href="#">Visa & Thủ tục</a></li>
                            <li><a href="#">Hỗ trợ lưu trú</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4>Liên hệ</h4>
                        <ul>
                            <li><i class="fas fa-phone"></i> +84 123 456 789</li>
                            <li><i class="fas fa-envelope"></i> info@duhocnb.com</li>
                            <li><i class="fas fa-map-marker-alt"></i> 123 Đường ABC, Q1, HCM</li>
                        </ul>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2024 Du Học NB. All rights reserved.</p>
                </div>
            </div>
        </footer>

        <!-- Back to Top Button -->
        <Transition name="fade">
            <button 
                v-show="showBackToTop" 
                @click="scrollToTop"
                class="back-to-top"
                :style="backToTopStyle"
            >
                <i class="fas fa-arrow-up"></i>
            </button>
        </Transition>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useNotification } from '~/composables/useNotification'
import { useScrollAnimation } from '~/composables/useScrollAnimation'
import "~/assets/css/style.css";
import "~/assets/css/responsive.css";

// Composables
const { showSuccess, showError } = useNotification()
const { animateOnScroll, observeElements } = useScrollAnimation()

// Form handling
const contactForm = ref(null)
const nameInput = ref(null)
const emailInput = ref(null)
const phoneInput = ref(null)

const formData = reactive({
    name: '',
    email: '',
    phone: '',
    message: ''
})

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

// Email validation
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Form submission
const handleSubmit = () => {
    // Basic validation
    if (!formData.name.trim()) {
        showError('Vui lòng nhập họ tên')
        nameInput.value?.focus()
        return
    }
    
    if (!formData.email.trim() || !isValidEmail(formData.email)) {
        showError('Vui lòng nhập email hợp lệ')
        emailInput.value?.focus()
        return
    }
    
    if (!formData.phone.trim()) {
        showError('Vui lòng nhập số điện thoại')
        phoneInput.value?.focus()
        return
    }
    
    // Show success message
    showSuccess('Cảm ơn bạn! Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.')
    
    // Reset form
    Object.keys(formData).forEach(key => {
        formData[key] = ''
    })
    
    // Log form data (replace with actual form submission)
    console.log('Form submitted:', { ...formData })
}

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