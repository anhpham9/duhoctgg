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
                                <input type="text" placeholder="Lời nhắn..." v-model="formData.message">
                            </div>
                            <button type="submit" class="btn btn-primary">Gửi tin nhắn</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useNotification } from '~/composables/useNotification'

// Composables
const { showSuccess, showError } = useNotification()

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