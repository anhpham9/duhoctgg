<template>
    <section class="page-hero">
        <div class="container">
            <div class="page-hero-content">
                <!-- Slot for custom content or default breadcrumb + title -->
                <slot>
                    <!-- Default breadcrumb if no custom content -->
                    <nav class="breadcrumb" v-if="showBreadcrumb">
                        <NuxtLink to="/">Trang chủ</NuxtLink>
                        <span>/</span>
                        <span v-if="breadcrumbItems && breadcrumbItems.length">
                            <template v-for="(item, index) in breadcrumbItems" :key="index">
                                <NuxtLink v-if="item.link" :to="item.link">{{ item.text }}</NuxtLink>
                                <span v-else>{{ item.text }}</span>
                                <span v-if="index < breadcrumbItems.length - 1"> / </span>
                            </template>
                        </span>
                        <span v-else>{{ breadcrumbText }}</span>
                    </nav>

                    <!-- Default title and subtitle -->
                    <h1 v-if="title">{{ title }}</h1>
                    <p v-if="subtitle">{{ subtitle }}</p>
                </slot>
            </div>
        </div>

        <!-- Wave Animation (always included) -->
        <div class="wave">
            <svg viewBox="0 0 2880 85" preserveAspectRatio="none">
                <path fill="#ffffff" d="M0,40
                    L60,35
                    C120,30,240,20,360,25
                    C480,30,600,50,720,55
                    C840,60,960,50,1080,45
                    C1200,40,1320,40,1380,40
                    L1440,40
                    L1440,85
                L0,85Z">
                </path>
                <path fill="#ffffff" d="M1440,40
                    L1500,35
                    C1560,30,1680,20,1800,25
                    C1920,30,2040,50,2160,55
                    C2280,60,2400,50,2520,45
                    C2640,40,2760,40,2820,40
                    L2880,40
                    L2880,85
                L1440,85Z">
                </path>
            </svg>
        </div>
    </section>
</template>

<script setup>
// Define props for flexibility
const props = defineProps({
    // Basic content props
    title: {
        type: String,
        default: ''
    },
    subtitle: {
        type: String, 
        default: ''
    },
    
    // Breadcrumb configuration
    showBreadcrumb: {
        type: Boolean,
        default: true
    },
    breadcrumbText: {
        type: String,
        default: ''
    },
    breadcrumbItems: {
        type: Array,
        default: () => []
        // Format: [{ text: 'About', link: '/about' }, { text: 'Current Page' }]
    }
})
</script>

<style scoped>
/* Page Hero */
.page-hero {
    padding: 120px 0 80px;
    margin-top: 40px;
    color: white;
    text-align: center;

    position: relative;
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    overflow: hidden;
}

.page-hero::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15), transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1), transparent 40%);
}

.page-hero h1 {
    font-size: 2.5rem;
    margin-bottom: 15px;
    font-weight: 700;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
}

.page-hero p {
    font-size: 1.2rem;
    margin-bottom: 20px;
    opacity: 0.9;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
}

.page-hero-content {
    position: relative;
    z-index: 2;
}

/* WAVE BASE */
.wave {
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    overflow: hidden;
    line-height: 0;
    z-index: 1;
}

.wave svg {
    display: block;
    width: 200%;
}

@media (max-width: 1024px) {
    .page-hero {
        padding: 100px 0 60px;
    }

    .page-hero h1 {
        font-size: 2.2rem;
    }

}

@media (max-width: 768px) {
    .page-hero {
        padding: 80px 0 40px;
        margin-top: 60px;
    }

    .page-hero h1 {
        font-size: 1.8rem;
    }

    .page-hero p {
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    
}
</style>