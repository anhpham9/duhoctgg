<template>
    <div>
        <section class="hero">
            <img :src="homepageBannerSrc" :alt="staticPage.meta_description || 'Cùng chúng tôi đồng hành cùng bạn'"
                class="hero-banner">
        </section>

        <section v-for="section in homepageSections" :key="section.id" class="home-dynamic-section">
            <div class="container">
                <div class="section-header">
                    <h2>{{ section.title }}</h2>
                    <p>{{ section.subtitle }}</p>
                </div>

                <div class="section-grid" v-if="section.type === 'card'" :style="cardGridStyle(section)">
                    <article v-for="(card, index) in normalizeCards(section.card_items)"
                        :key="`${section.id}-card-${index}`" class="dynamic-card"
                        :class="`${section.card_layout || 'bg-red'}`">
                        <div class="card-icon">
                            <i :class="card.icon"></i>
                        </div>
                        <h3>{{ card.title }}</h3>
                        <p>{{ card.content }}</p>
                    </article>
                </div>

                <div :class="sectionMediaClass('section-list', section)" v-else-if="section.type === 'list'">
                    <div class="section-list-text">
                        <ul class="section-list-items">
                            <li v-for="(item, index) in normalizeList(section.list_items)"
                                :key="`${section.id}-${index}`">
                                <i :class="section.list_icon || 'fas fa-check'"></i>
                                <span>{{ item }}</span>
                            </li>
                        </ul>
                        <a v-if="section.contact_btn_show && section.contact_btn_text" href="#contact"
                            class="btn btn-primary">{{ section.contact_btn_text }}</a>
                    </div>
                    <div v-if="section.image_url" class="section-list-image">
                        <img :src="section.image_url" :alt="section.title">
                    </div>
                </div>

                <div :class="sectionMediaClass('section-paragraph', section)" v-else-if="section.type === 'paragraph'">
                    <div class="section-paragraph-text">
                        <div class="paragraph-text">{{ section.paragraph_text }}</div>
                        <a v-if="section.contact_btn_show && section.contact_btn_text" href="#contact"
                            class="btn btn-primary">{{ section.contact_btn_text }}</a>
                    </div>
                    <div v-if="section.image_url" class="section-paragraph-image">
                        <img :src="section.image_url" :alt="section.title">
                    </div>
                </div>

                <template v-else-if="section.type === 'roadmap'">
                    <ul class="roadmap-timeline">
                        <li class="roadmap-step" v-for="(item, index) in normalizeRoadmap(section.roadmap_items)"
                            :key="`${section.id}-${index}`">
                            <div class="step-number">BƯỚC <span>{{ String(index + 1).padStart(2, '0') }}</span></div>
                            <div class="step-line"></div>
                            <div class="step-content">
                                <h4>{{ item.title }}</h4>
                                <p>{{ item.content }}</p>
                            </div>
                        </li>
                    </ul>
                    <a v-if="section.contact_btn_show && section.contact_btn_text" href="#contact"
                        class="btn btn-primary">{{ section.contact_btn_text }}</a>

                </template>

            </div>
        </section>

        <FAQ v-if="myFaqData.length" title="Câu Hỏi Thường Gặp" subtitle="" :faq-data="myFaqData" />
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePublicFAQs } from '~/composables/useFAQ'

const config = useRuntimeConfig()

const { faqs: myFaqData } = usePublicFAQs('general')

const { data: staticPageData } = await useFetch(`${config.public.apiBase}/public/static-pages/home`, {
    key: 'public-static-page-home'
})

const { data: publicGeneralSettingsData } = await useFetch(`${config.public.apiBase}/public/general-settings`, {
    key: 'public-general-settings'
})

const { data: homepageSectionsData } = await useFetch(`${config.public.apiBase}/public/homepage-sections`, {
    key: 'public-homepage-sections'
})

const staticPage = computed(() => staticPageData.value?.data || {})
const homepageBannerSrc = computed(() => {
    const configuredBanner = String(publicGeneralSettingsData.value?.data?.homepageBannerUrl || '').trim()
    return configuredBanner || '/assets/images/banner.jpg'
})

const {
    seo: siteSeo,
    pending: siteSeoPending,
    error: siteSeoError,
    refresh
} = useSiteSeo()

const currentPageOgUrl = useAbsolutePageUrl({
    baseUrl: () => siteSeo.value.siteUrl
})

useSeoMeta({
    title: () =>
        staticPage.value.meta_title ||
        siteSeo.value.defaultTitle,

    description: () =>
        staticPage.value.meta_description ||
        siteSeo.value.defaultDescription,

    ogTitle: () =>
        staticPage.value.meta_title ||
        siteSeo.value.defaultTitle,

    ogDescription: () =>
        staticPage.value.meta_description ||
        siteSeo.value.defaultDescription,

    ogImage: () => siteSeo.value.defaultOgImage,

    ogType: 'website'
})

useHead(() => ({
    meta: [
        {
            property: 'og:url',
            content: currentPageOgUrl.value
        }
    ]
}))

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
            contact_btn_show: false,
            contact_btn_text: 'Liên hệ tư vấn',
            image_position: 1,
            list_icon: '',
            list_items: [],
            card_desktop_columns: 4,
            card_tablet_columns: 2,
            card_items: [],
            card_layout: 'bg-white',
            roadmap_items: [],
            sort_order: 0
        }
    ]
})

const sectionMediaClass = (baseClass, section) => {
    const hasImage = Boolean(section?.image_url)
    const isLeft = Number(section?.image_position) === 0

    return [
        baseClass,
        hasImage ? 'has-image' : '',
        hasImage && isLeft ? 'image-left' : 'image-right'
    ].filter(Boolean).join(' ')
}

const cardGridStyle = (section) => ({
    '--desktop-columns': Math.min(Math.max(Number(section?.card_desktop_columns || 4), 1), 6),
    '--tablet-columns': Math.min(Math.max(Number(section?.card_tablet_columns || 2), 1), 4)
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

const normalizeRoadmap = (value) => {
    if (!Array.isArray(value)) return []

    return value
        .map((item) => ({
            title: String(item?.title || '').trim(),
            content: String(item?.content || '').trim()
        }))
        .filter((item) => item.title && item.content)
}
</script>

<<style scoped>
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
    max-height: calc(100vh - 140px);
}

/* Services Section */
.home-dynamic-section {
    padding: 80px 0;
}

.home-dynamic-section:nth-child(odd) {
    background: #fff;
}

.home-dynamic-section:nth-child(even) {
    background: #f8f9fa;
}

/* Services Grid */
.section-grid {
    display: grid;
    grid-template-columns: repeat(var(--desktop-columns, 4), minmax(0, 1fr));
    gap: 20px;
}

.section-list,
.section-paragraph {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
}

.section-list.has-image.image-right,
.section-paragraph.has-image.image-right {
    grid-template-columns: 1fr 1fr;
    grid-template-areas: "content image";
}

.section-list.has-image.image-left,
.section-paragraph.has-image.image-left {
    grid-template-columns: 1fr 1fr;
    grid-template-areas: "image content";
}

.section-paragraph-text,
.section-list-text {
    grid-area: content;
}

.section-paragraph-image,
.section-list-image {
    grid-area: image;
}

.paragraph-text {
    line-height: 1.6;
    font-size: 1rem;
    color: #555;
    padding-bottom: 20px;
}

.dynamic-card {
    padding: 40px 30px;
    border-radius: 15px;
    text-align: center;
    transition: all 0.3s ease;
}

.dynamic-card:hover {
    transform: translateY(-10px);
}

.dynamic-card.bg-red {
    background: #d32f2f;
    color: white;
    box-shadow: 0 5px 20px rgba(211, 47, 47, 0.2);
}

.dynamic-card.bg-red:hover {
    box-shadow: 0 15px 35px rgba(211, 47, 47, 0.4);
}

.dynamic-card.bg-white {
    background: #ffffff;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f0f0;
}

.dynamic-card.bg-white:hover {
    box-shadow: 0 15px 35px rgba(211, 47, 47, 0.15);
    border-color: #d32f2f;
}

.dynamic-card.border-top {
    background: white;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    border-top: 4px solid #d32f2f;
}

.dynamic-card.border-top:hover {
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.card-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
}

.bg-red .card-icon {
    background: rgba(255, 255, 255, 0.2);
}

.dynamic-card.bg-white .card-icon {
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    position: relative;
    box-shadow: 0 8px 25px rgba(211, 47, 47, 0.3);
}

.dynamic-card.bg-white .card-icon::after {
    content: '';
    position: absolute;
    width: 100px;
    height: 100px;
    border: 2px solid rgba(211, 47, 47, 0.2);
    border-radius: 50%;
    animation: rotate 3s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.border-top .card-icon {
    background: linear-gradient(135deg, #d32f2f, #f44336);
}

.card-icon i {
    font-size: 2rem;
    color: #fff;
}

.dynamic-card.bg-white .card-icon i {
    position: relative;
    z-index: 2;
}

.dynamic-card h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    font-weight: 600;
}

.bg-red.dynamic-card h3 {
    color: #feef01;
}

.border-top .dynamic-card h3 {
    color: #333;
}

.dynamic-card p {
    line-height: 1.6;
}

.bg-red.dynamic-card p {
    opacity: 0.9;
}

.border-top.dynamic-card p {
    color: #666;
    font-size: 0.95rem;
}

.section-paragraph-image img,
.section-list-image img {
    width: 100%;
    height: auto;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    display: block;
}

.section-list-items {
    list-style: none;
    margin-bottom: 30px;
}

.section-list-items li {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;
    padding: 15px 0;
    border-bottom: 1px solid #e0e0e0;
}

.section-list-items li i {
    color: #4caf50;
    margin-right: 15px;
    margin-top: 5px;
    font-size: 1.2rem;
}


/* Why Choose Section */


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
    /* .section-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    } */

    .section-grid {
        grid-template-columns: repeat(var(--tablet-columns, 2), minmax(0, 1fr));
    }

    .section-list.has-image.image-right,
    .section-paragraph.has-image.image-right {
        grid-template-columns: 3fr 2fr;
    }

    .section-list.has-image.image-left,
    .section-paragraph.has-image.image-left {
        grid-template-columns: 2fr 3fr;
    }

    /* .why-choose-content,
    .contact-content,
    .fee-content,
    .about-content {
    gap: 40px;
    }

    .conditions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;
    } */

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

    .home-dynamic-section,
    .roadmap {
        padding: 60px 0;
    }

    /* .section-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    } */

    .section-grid {
        grid-template-columns: 1fr;
    }

    .section-list.has-image.image-right,
    .section-paragraph.has-image.image-right,
    .section-list.has-image.image-left,
    .section-paragraph.has-image.image-left {
        grid-template-columns: 1fr;
        grid-template-areas:
            "image"
            "content";
    }

    .dynamic-card {
        padding: 30px 20px;
    }

    /* .why-choose-content,
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
    } */

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


    .dynamic-card {
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