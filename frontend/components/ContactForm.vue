<template>
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
                                <input ref="nameInput" type="text" placeholder="Họ và tên *" v-model="formData.name"
                                    required>
                            </div>
                            <div class="form-group">
                                <input ref="emailInput" type="email" placeholder="Email *" v-model="formData.email"
                                    required>
                            </div>
                            <div class="form-group">
                                <input ref="phoneInput" type="tel" placeholder="Số điện thoại *"
                                    v-model="formData.phone" required>
                            </div>
                            <div class="form-group">
                                <input ref="messageInput" type="text" placeholder="Lời nhắn..." v-model="formData.message">
                            </div>
                            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                                <span v-if="isSubmitting">Đang gửi...</span>
                                <span v-else>Gửi tin nhắn</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useNotifications } from '~/composables/useNotifications'

// Composables
const { showSuccess, showError } = useNotifications()
const route = useRoute()

// Form handling
const contactForm = ref(null)
const nameInput = ref(null)
const emailInput = ref(null)
const phoneInput = ref(null)
const messageInput = ref(null)

const formData = reactive({
    name: '',
    email: '',
    phone: '',
    message: ''
})

const normalizeQueryValue = (value) => {
    if (Array.isArray(value)) {
        return String(value[0] || '').trim()
    }
    return String(value || '').trim()
}

const applyDefaultMessageFromQuery = () => {
    const contactMessage = normalizeQueryValue(route.query.contactMessage)
    if (!contactMessage) return
    if (formData.message.trim()) return

    formData.message = contactMessage
}

const hasRepeatedSingleChar = (value) => /^([a-z0-9])\1{6,}$/i.test(value)

const hasRepeatedChunk = (value) => /^(.{2,4})\1{2,}$/i.test(value)

const isLowQualityAlphabeticText = (value) => {
    if (!/^[a-z]+$/i.test(value)) return false
    if (value.length < 8) return false

    const uniqueChars = new Set(value.toLowerCase()).size
    const vowelCount = (value.match(/[aeiouy]/gi) || []).length

    return uniqueChars <= 3 || vowelCount <= 1
}

const isSpamLikeMessage = (message) => {
    const normalized = String(message || '').toLowerCase().trim()
    if (!normalized) return true

    const compact = normalized.replace(/\s+/g, '')
    if (!compact) return true

    if (/^\d+$/.test(compact)) return true
    if (hasRepeatedSingleChar(compact)) return true
    if (hasRepeatedChunk(compact)) return true
    if (isLowQualityAlphabeticText(compact)) return true

    return false
}

// Email validation
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Form submission
const isSubmitting = ref(false)

const handleSubmit = async () => {
    // Prevent double submission
    if (isSubmitting.value) return
    
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

    const trimmedMessage = formData.message.trim()
    if (!trimmedMessage) {
        showError('Vui lòng nhập lời nhắn')
        messageInput.value?.focus()
        return
    }

    if (trimmedMessage.length < 10) {
        showError('Lời nhắn phải có tối thiểu 10 ký tự')
        messageInput.value?.focus()
        return
    }

    if (isSpamLikeMessage(trimmedMessage)) {
        showError('Nội dung lời nhắn chưa hợp lệ hoặc có dấu hiệu spam. Vui lòng nhập chi tiết hơn.')
        messageInput.value?.focus()
        return
    }

    try {
        isSubmitting.value = true
        
        // Submit to backend API
        const response = await $fetch('/api/public/contact', {
            method: 'POST',
            body: {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                message: trimmedMessage
            }
        })

        if (response.success) {
            showSuccess(response.message || 'Cảm ơn bạn! Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.')
            
            // Reset form
            Object.keys(formData).forEach(key => {
                formData[key] = ''
            })
        } else {
            showError(response.message || 'Có lỗi xảy ra, vui lòng thử lại')
        }
        
    } catch (error) {
        console.error('Contact form submission error:', error)
        
        // Handle specific error cases
        if (error.statusCode === 429) {
            showError('Bạn đã gửi quá nhiều tin nhắn. Vui lòng thử lại sau.')
        } else if (error.statusCode === 400 && error.data?.errors) {
            // Show validation errors from backend
            showError(error.data.errors.join(', '))
        } else {
            showError('Có lỗi xảy ra, vui lòng thử lại sau')
        }
    } finally {
        isSubmitting.value = false
    }
}

watch(
    () => route.query.contactMessage,
    () => {
        applyDefaultMessageFromQuery()
    }
)

onMounted(() => {
    applyDefaultMessageFromQuery()
})
</script>

<style scoped>
/* Contact Section */
.contact {
    margin-bottom: -155px;
    z-index: 9;
    position: relative;
}

.ft-form-inner {
    background-image: linear-gradient(138deg, #BE1E2D 30%, #c73f3f 100%);
    border-radius: 30px;
    box-shadow: 0 5px 62px 0 rgb(2 55 102 / 9%);
    position: relative;
    padding: 50px 15px 80px;
    overflow: hidden;
    color: #fff;
}

.ft-form-inner:before {
    position: absolute;
    content: "";
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-image: url(/ft1.png);
    background-position: bottom right;
    background-repeat: no-repeat;
}

.ft-form-inner1 {
    position: relative;
}

.full-section {
    width: 100% !important;
}

.contact .section-header {
    margin-bottom: 30px;
}

.contact .section-header>h2,
.contact .section-header>p {
    color: white;
    margin-bottom: 0px;
}

.contact-form {
    padding: 0 40px;
    border-radius: 15px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 20px;
}

.form-group {
    margin-bottom: 0;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 15px;
    border: 2px solid #fff;
    border-radius: 40px;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #d32f2f;
    box-shadow: 0 0 10px rgba(211, 47, 47, 0.1);
}

.contact-form .btn {
    /* margin: 0 auto; */
    /* display: block; */
    /* width: fit-content; */
    grid-column: 1 / -1;
    justify-self: center;
}

@media (max-width: 1024px) {
    
}

@media (max-width: 768px) {
    

    .contact {
        margin-bottom: -280px;
    }

    .ft-form-inner {
        padding-bottom: 20px;
    }

    .ft-form-inner1 .section-header {
        margin-bottom: 20px;
    }

    .contact-form {
        display: block;
        grid-template-columns: none;
        grid-template-rows: none;
        gap: 0;
        padding: 0 20px;
    }

    .form-group {
        margin-bottom: 20px;
    }

    .contact-form .btn {
        grid-column: unset;
    }
}

@media (max-width: 480px) {
    .contact-form {
        padding: 25px 15px;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        padding: 12px;
        font-size: 0.9rem;
    }
}
</style>