<template>
    <section id="faq" class="faq">
        <div class="container">
            <div class="section-header">
                <h2>{{ title }}</h2>
                <p v-if="subtitle">{{ subtitle }}</p>
            </div>
            <div class="faq-list">
                <div v-for="(faq, index) in faqData" :key="index" class="faq-item"
                    :class="{ active: activeIndex === index }" @click="toggleFAQ(index)">
                    <div class="faq-question">
                        <h4>{{ faq.question }}</h4>
                        <i class="fas faq-icon" :class="activeIndex === index ? 'fa-minus' : 'fa-plus'"></i>
                    </div>
                    <div ref="faqAnswers" class="faq-answer"
                        :style="{ height: activeIndex === index ? faqHeights[index] + 'px' : '0px' }">
                        <p>{{ faq.answer }}</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

// Props
const props = defineProps({
    title: {
        type: String,
        default: 'Câu Hỏi Thường Gặp'
    },
    subtitle: {
        type: String,
        default: 'Các câu hỏi phổ biến về dịch vụ của chúng tôi'
    },
    faqData: {
        type: Array,
        required: true,
        validator: (value) => {
            return value.every(item => item.question && item.answer)
        }
    }
})

// Reactive state
const activeIndex = ref(null)
const faqAnswers = ref([])
const faqHeights = ref([])

// Toggle FAQ function (converted from main.js)
const toggleFAQ = async (index) => {
    if (activeIndex.value === index) {
        // Close current item
        activeIndex.value = null
    } else {
        // Open new item and close others
        activeIndex.value = index

        // Calculate height for smooth animation
        await nextTick()
        if (faqAnswers.value[index]) {
            const scrollHeight = faqAnswers.value[index].scrollHeight
            faqHeights.value[index] = scrollHeight
        }
    }
}

// Calculate all heights on mount
onMounted(async () => {
    await nextTick()
    faqHeights.value = faqAnswers.value.map(el => {
        return el ? el.scrollHeight : 0
    })
})
</script>

<style scoped>
/* FAQ specific styles - inherits from global style.css */

.faq {
    padding: 80px 0;
    background: white;
}

.faq-list {
    max-width: 800px;
    margin: 0 auto;
}

.faq-item {
    background: white;
    margin-bottom: 20px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
}

.faq-question {
    background: #d32f2f;
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
}

.faq-question:hover {
    background: #b71c1c;
}

.faq-question h4 {
    font-size: 1.1rem;
    font-weight: 600;
}

.faq-answer {
    opacity: 0;
    transform: translateY(-10px);
    height: 0;
    overflow: hidden;

    transition: height 0.35s ease,
        opacity 0.25s ease,
        transform 0.25s ease;
}

.faq-answer p {
    line-height: 1.6;
    color: #666;
    padding: 10px;
}

.faq-item.active .faq-answer {
    opacity: 1;
    transform: translateY(0);
    max-height: 500px;
}

.faq-icon {
    font-size: 1rem;
    transition: all 0.3s ease;
    min-width: 16px;
    text-align: center;
}

/* Active state */

.faq-item.active .faq-question {
    background: #b71c1c;
}

.faq-item.active .faq-icon {
    transform: rotate(180deg);
}

@media (max-width: 1024px) {}

@media (max-width: 768px) {

    .faq {
        padding: 60px 0;
    }
}

@media (max-width: 480px) {}
</style>