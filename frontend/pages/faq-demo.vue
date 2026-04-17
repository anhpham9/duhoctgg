<template>
    <div class="faq-demo-page">
        <!-- Hero Section -->
        <section class="page-hero">
            <div class="container">
                <div class="page-hero-content">
                    <h1>Demo FAQ Component</h1>
                    <p>Ví dụ sử dụng FAQ component với nhiều loại nội dung khác nhau</p>
                </div>
            </div>
        </section>

        <!-- FAQ Section 1: General -->
        <FAQ 
            title="Câu Hỏi Chung Về Dịch Vụ"
            subtitle="Những thắc mắc phổ biến về dịch vụ du học"
            :faq-data="generalFaq"
        />

        <!-- FAQ Section 2: School -->
        <FAQ 
            title="Thông Tin Trường Học"
            subtitle="Câu hỏi về nhập học và yêu cầu"
            :faq-data="schoolFaq"
        />

        <!-- FAQ Section 3: Visa -->
        <FAQ 
            title="Thủ Tục Visa"
            subtitle="Hướng dẫn và câu hỏi về visa du học"
            :faq-data="visaFaq"
        />

        <!-- FAQ Section 4: Custom -->
        <FAQ 
            title="Câu Hỏi Tùy Chỉnh"
            subtitle="Ví dụ với dữ liệu được tạo custom"
            :faq-data="customFaq"
        />
    </div>
</template>

<script setup>
import { useFAQ } from '~/composables/useFAQ'

// Meta data cho SEO
definePageMeta({
    title: 'FAQ Demo',
    description: 'Demo trang FAQ với component tái sử dụng'
})

// Sử dụng FAQ composable
const { getFAQData, createFAQData } = useFAQ()

// Lấy dữ liệu FAQ từ presets
const generalFaq = getFAQData('general')
const schoolFaq = getFAQData('school') 
const visaFaq = getFAQData('visa')

// Tạo FAQ data tùy chỉnh
const customFaq = createFAQData([
    {
        question: "Làm sao để book lịch tư vấn?",
        answer: "Bạn có thể book lịch qua website, gọi hotline hoặc đến trực tiếp văn phòng của chúng tôi."
    },
    {
        question: "Có hỗ trợ online không?",
        answer: "Có! Chúng tôi hỗ trợ tư vấn online qua Zoom, Google Meet hoặc các platform khác."
    },
    {
        q: "Chi nhánh ở đâu?", // Support cả 'q' và 'question'
        a: "Chúng tôi có chi nhánh tại TP.HCM, Hà Nội và Đà Nẵng."
    }
])
</script>

<style scoped>
.faq-demo-page {
    min-height: 100vh;
}

.page-hero {
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    color: white;
    text-align: center;
    padding: 100px 0 60px;
    margin-top: 80px; /* Account for fixed header */
}

.page-hero h1 {
    font-size: 2.5rem;
    margin-bottom: 15px;
    font-weight: 700;
}

.page-hero p {
    font-size: 1.2rem;
    opacity: 0.9;
}
</style>