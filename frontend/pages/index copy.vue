<template>
    <div>
        <section class="hero">
            <img src="/assets/images/banner.jpg" alt="Du học Nhật Bản - Vững bước tương lai" class="hero-banner">
        </section>

        <section v-for="section in homepageSections" :key="section.id" class="home-dynamic-section">
            <div class="container">
                <div class="section-header">
                    <h2>{{ section.title }}</h2>
                    <p v-if="section.subtitle">{{ section.subtitle }}</p>
                </div>

                <p v-if="section.description" class="section-description">{{ section.description }}</p>

                <div v-if="section.type === 'paragraph'" class="paragraph-block">
                    <div class="paragraph-text" v-if="section.paragraph_text">{{ section.paragraph_text }}</div>
                    <div class="paragraph-image" v-if="section.image_url">
                        <img :src="section.image_url" :alt="section.title">
                    </div>
                </div>

                <div v-else-if="section.type === 'list'" class="list-block" :class="{ 'list-block-with-image': !!section.image_url }">
                    <div class="paragraph-image" v-if="section.image_url">
                        <img :src="section.image_url" :alt="section.title">
                    </div>
                    <ul class="dynamic-list">
                        <li v-for="(item, index) in normalizeList(section.list_items)" :key="`${section.id}-${index}`">
                            <i :class="section.list_icon || 'fas fa-check'"></i>
                            <span>{{ item }}</span>
                        </li>
                    </ul>
                </div>

                <div v-else-if="section.type === 'card'" class="dynamic-card-grid">
                    <article v-for="(card, index) in normalizeCards(section.card_items)" :key="`${section.id}-card-${index}`"
                        class="dynamic-card" :class="`layout-${section.card_layout || 'bg-red'}`">
                        <i :class="card.icon"></i>
                        <h3>{{ card.title }}</h3>
                        <p>{{ card.content }}</p>
                    </article>
                </div>

                <NuxtLink v-if="section.contact_btn_show && section.contact_btn_text" to="/contact" class="btn btn-primary">
                    {{ section.contact_btn_text }}
                </NuxtLink>
            </div>
        </section>

        <FAQ title="Câu Hỏi Thường Gặp" subtitle="Thắc mắc về dịch vụ du học" :faq-data="myFaqData" />
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFAQ } from '~/composables/useFAQ'

const { getFAQData } = useFAQ()
const myFaqData = getFAQData('general') // or 'school', 'visa'

const config = useRuntimeConfig()

const { data: staticPageData } = await useFetch(`${config.public.apiBase}/public/static-pages/home`, {
    key: 'public-static-page-home'
})

const { data: homepageSectionsData } = await useFetch(`${config.public.apiBase}/public/homepage-sections`, {
    key: 'public-homepage-sections'
})

const staticPage = computed(() => staticPageData.value?.data || {})

useHead(() => {
    const metaTitle = staticPage.value.meta_title || staticPage.value.title || 'Trang chủ - Du học NB'
    const metaDescription = staticPage.value.meta_description || staticPage.value.hero_description || 'Du học NB đồng hành cùng bạn trên hành trình du học Nhật Bản.'

    return {
        title: metaTitle,
        meta: [
            { name: 'description', content: metaDescription },
            { property: 'og:title', content: metaTitle },
            { property: 'og:description', content: metaDescription }
        ]
    }
})

const homepageSections = computed(() => {
    const rows = Array.isArray(homepageSectionsData.value?.data) ? homepageSectionsData.value.data : []
    if (rows.length) return rows

    return [
        {
            id: 'fallback-home-section',
            title: 'Nội dung trang chủ đang được cập nhật',
            subtitle: 'Bạn có thể chỉnh sửa tại Admin > Content > Homepage > Sections',
            description: 'Dữ liệu sections sẽ hiển thị ở đây ngay sau khi bạn tạo và bật trạng thái active.',
            type: 'paragraph',
            paragraph_text: 'Hãy thêm section mới để hiển thị nội dung động trên trang chủ.',
            image_url: '',
            contact_btn_show: true,
            contact_btn_text: 'Liên hệ tư vấn',
            list_icon: '',
            list_items: [],
            card_items: [],
            card_layout: 'bg-white',
            sort_order: 0
        }
    ]
})

const normalizeList = (value) => {
    if (!Array.isArray(value)) return []

    return value
        .map((item) => {
            if (typeof item === 'string') return item.trim()
            if (item && typeof item === 'object') return String(item.text || item.value || '').trim()
            return ''
        })
        .filter(Boolean)
}

const normalizeCards = (value) => {
    if (!Array.isArray(value)) return []

    return value
        .map((item) => ({
            icon: String(item?.icon || '').trim() || 'fas fa-star',
            title: String(item?.title || '').trim(),
            content: String(item?.content || '').trim()
        }))
        .filter((item) => item.title && item.content)
}
</script>

<style scoped>
/* ===================
index style
==================== */
/* Hero Section */
.hero {
    padding: 0;
    margin: 125px 0 0 0;
    position: relative;
    overflow: hidden;
}

.hero-banner {
    width: 100%;
    height: auto;
    display: block;
    max-width: 100%;
    object-fit: cover;
}

.home-dynamic-section {
    padding: 72px 0;
    background: #fff;
}

.home-dynamic-section:nth-of-type(odd) {
    background: #f8f9fa;
}

.section-description {
    max-width: 880px;
    margin: 0 auto 1.5rem;
    text-align: center;
    color: #5f6672;
    line-height: 1.75;
}

.paragraph-block {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 1.5rem;
    align-items: start;
}

.paragraph-text {
    color: #464f5d;
    line-height: 1.8;
    white-space: pre-line;
}

.paragraph-image img {
    width: 100%;
    border-radius: 14px;
    object-fit: cover;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.list-block {
    display: grid;
    gap: 1.25rem;
}

.list-block-with-image {
    grid-template-columns: 0.9fr 1.1fr;
    align-items: start;
}

.dynamic-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.8rem;
}

.dynamic-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    padding: 0.75rem 0.85rem;
    border-radius: 10px;
    background: #fff;
}

.dynamic-list i {
    margin-top: 0.15rem;
    color: #d32f2f;
}

.dynamic-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
}

.dynamic-card {
    border-radius: 12px;
    padding: 1rem;
    border: 1px solid #e4e8ef;
}

.dynamic-card i {
    font-size: 1.25rem;
    margin-bottom: 0.55rem;
}

.dynamic-card h3 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
}

.dynamic-card p {
    margin: 0;
    line-height: 1.6;
}

.dynamic-card.layout-bg-red {
    background: #d32f2f;
    color: #fff;
    border-color: #d32f2f;
}

.dynamic-card.layout-bg-white {
    background: #fff;
    color: #333;
}

.dynamic-card.layout-border-top {
    background: #fff;
    color: #333;
    border-top: 4px solid #d32f2f;
}

/* Services Section */
.services {
    padding: 80px 0;
    background: #f8f9fa;
}

/* Services Grid */
.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.service-card {
    background: #d32f2f;
    color: white;
    padding: 40px 30px;
    border-radius: 15px;
    text-align: center;
    transition: all 0.3s ease;
    box-shadow: 0 5px 20px rgba(211, 47, 47, 0.2);
}

.service-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 35px rgba(211, 47, 47, 0.4);
}

.service-icon {
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
}

.service-icon i {
    font-size: 2rem;
    color: #fff;
}

.service-card h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    font-weight: 600;
    color: #feef01;
}

.service-card p {
    line-height: 1.6;
    opacity: 0.9;
}

/* Why Choose Section */
.why-choose {
    padding: 80px 0;
    background: #fff;
}

.why-choose-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
}

.why-choose-list {
    list-style: none;
    margin-bottom: 30px;
}

.why-choose-list li {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;
    padding: 15px 0;
    border-bottom: 1px solid #e0e0e0;
}

.why-choose-list li:last-child {
    border-bottom: none;
}

.why-choose-list li i {
    color: #4caf50;
    margin-right: 15px;
    margin-top: 5px;
    font-size: 1.2rem;
}

.why-choose-list li span {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #555;
}

.why-choose-image img {
    width: 100%;
    height: auto;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* Schools Section - Điều Kiện Du Học */
.conditions {
    padding: 80px 0;
    background: #f8f9fa;
}

.conditions-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
    margin-top: 50px;
}

.condition-card {
    background: white;
    padding: 40px 30px;
    border-radius: 15px;
    text-align: center;
    transition: all 0.3s ease;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    border-top: 4px solid #d32f2f;
}

.condition-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.condition-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #d32f2f, #f44336);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
}

.condition-icon i {
    font-size: 2rem;
    color: #fff;
}

.condition-card h4 {
    font-size: 1.3rem;
    margin-bottom: 15px;
    color: #333;
    font-weight: 600;
}

.condition-card p {
    color: #666;
    line-height: 1.6;
    font-size: 0.95rem;
}

/* Fee Info Section */
.fee-info {
    padding: 80px 0;
    background: #fff;
}

.fee-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
}

.fee-list {
    list-style: none;
    margin-bottom: 30px;
}

.fee-list li {
    display: flex;
    align-items: flex-start;
    /* margin-bottom: 20px; */
    padding: 10px 0;
    /* border-bottom: 1px solid #e0e0e0; */
}

.fee-list li:last-child {
    border-bottom: none;
}

.fee-list li i {
    color: #4caf50;
    margin-right: 15px;
    margin-top: 5px;
    font-size: 1.2rem;
}

.fee-list li span {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #555;
}

.fee-image img {
    width: 100%;
    height: auto;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* Roadmap Section */
.roadmap {
    padding: 80px 0;
    background: #f8f9fa;
}

.roadmap-timeline {
    width: 960px;
    margin: 40px auto 20px;
    max-width: 100%;
}

.roadmap-timeline .roadmap-step {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    flex-wrap: wrap;
    margin-bottom: 25px;
}

.roadmap-timeline li:last-child {
    margin-bottom: 0;
}

.roadmap-timeline li:last-child .step-line:after {
    background: rgb(251, 251, 251);
}

.step-number {
    width: 200px;
    height: 71px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background-image: linear-gradient(108deg, rgb(255, 77, 52), rgb(255, 196, 1));
    color: #fff;
    font-weight: bold;
    font-size: 27px;
    flex: none;
    line-height: 1.3;
}

.step-number:before {
    top: 6px;
    left: 6px;
    width: 100%;
    height: 100%;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0);
    border: 2px solid rgba(243, 223, 223, 0.5);
    content: "";
    position: absolute;
}

.step-number span {
    font-size: 42px;
    text-shadow: rgb(241, 101, 58) 1px 2px 3px;
    margin-left: 6px;
    position: relative;
    line-height: 1.1;
    margin-top: -4px;
    border-bottom: 2px solid rgba(255, 255, 255, 0.4);
}

.step-line {
    height: 100%;
    position: relative;
}

.step-line:before {
    width: 12px;
    height: 12px;
    background: #f2430d;
    border-radius: 50%;
    position: absolute;
    z-index: 5;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    content: "";
}

.step-line:after {
    position: absolute;
    height: 250px;
    top: 50%;
    left: 50%;
    width: 1px;
    background: #d7d7d7;
    content: "";
}

.step-content {
    background: #fff;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 30px -15px;
    width: calc(100% - 305px);
    max-width: 100%;
    position: relative;
    flex: none;
    padding: 33px 15px 33px 25px;
    font-size: 14px;
}

.step-content h4 {
    font-size: 18px;
    color: #c4161c;
    margin: 0 0 10px;
    font-weight: 600;
}

.roadmap .btn {
    margin: 50px auto 0;
}

@media (max-width: 1024px) {

    /* ===================
    index style
    ==================== */
    .services-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
    }

    .why-choose-content,
    .contact-content,
    .fee-content,
    .about-content {
        gap: 40px;
    }

    .conditions-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 25px;
    }

    .roadmap-timeline {
        max-width: 100%;
        padding: 0 15px;
        width: 100%;
    }

    .roadmap-timeline .roadmap-step {
        margin-bottom: 30px;
    }

    .step-number span {
        font-size: 36px;
    }

    .step-content {
        width: calc(100% - 285px);
        padding: 25px 15px 25px 20px;
    }

    .contact {
        margin-bottom: -172px;
    }

    .ft-form-inner {
        padding-bottom: 40px;
    }

    .ft-form-inner1 .section-header {
        margin-bottom: 30px;
    }

    .footer {
        padding: 220px 0 15px;
    }
}

@media (max-width: 768px) {

    .paragraph-block {
        grid-template-columns: 1fr;
    }


    .services,
    .conditions,
    .fee-info,
    .why-choose,
    .roadmap {
        padding: 60px 0;
    }

    .services-grid {
        grid-template-columns: 1fr;
        gap: 12px;
    }

    .service-card {
        padding: 30px 20px;
    }

    .why-choose-content,
    .contact-content,
    .fee-content,
    .about-content {
        grid-template-columns: 1fr;
        gap: 30px;
    }

    .conditions-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .condition-card {
        padding: 30px 20px;
    }

    .fee-list li span {
        font-size: 1rem;
    }

    .roadmap-timeline {
        max-width: 100%;
        padding: 0 15px;
        width: 100%;
    }

    .roadmap-timeline .roadmap-step {
        flex-direction: column;
        align-items: center;
        margin-bottom: 40px;
        gap: 0;
    }

    .step-number {
        width: 160px;
        height: 60px;
        font-size: 20px;
        margin-bottom: 20px;
        order: 1;
    }

    .step-number span {
        font-size: 32px;
    }

    .step-line {
        display: none;
    }

    .step-content {
        width: 100%;
        padding: 25px 20px;
        margin: 0;
        order: 2;
        text-align: center;
    }

    .step-content h4 {
        font-size: 16px;
    }
}

@media (max-width: 480px) {


    .service-card {
        padding: 25px 15px;
    }
}

@media (max-width: 768px) and (orientation: landscape) {
    .hero {
        padding: 0;
        margin: 125px 0 0 0;
    }

    .hero-banner {
        width: 100%;
        height: auto;
    }
}

/* High DPI Displays */
@media (-webkit-min-device-pixel-ratio: 2),
(min-resolution: 192dpi) {
    .hero-banner {
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
    }
}
</style>