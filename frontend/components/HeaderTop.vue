<template>
    <div ref="headerTop" class="header-top" :class="{ hidden: isHidden }">
        <div class="container">
            <div class="header-top-content">
                <div class="social-icons-top">
                    <a v-for="item in socialLinks" :key="item.id" :href="item.url" class="social-icon" target="_blank"
                        rel="noopener noreferrer" :aria-label="item.name">
                        <i :class="item.icon || 'fas fa-link'"></i>
                    </a>
                </div>
                <div class="contact-info-top">
                    <div v-if="displayEmail">
                        <a :href="`mailto:${displayEmail}`" class="email-info">
                            <i class="fas fa-envelope"></i>
                            <span>{{ displayEmail }}</span>
                        </a>
                    </div>
                    <div v-if="displayHotline">
                        <a :href="`tel:${displayHotline}`" class="hotline-info">
                            <i class="fas fa-phone"></i>
                            <span class="hotline-label">Hotline: </span><span>{{ displayHotline }}</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const config = useRuntimeConfig()

// Dùng cùng key với Footer.vue → Nuxt dedup, không gọi thêm request
const { data } = await useFetch(`${config.public.apiBase}/public/footer`, {
    key: 'public-footer-data'
})

const footer = computed(() => data.value?.data || {})

const socialLinks = computed(() => {
    const list = Array.isArray(footer.value.socialLinks) ? footer.value.socialLinks : []
    return list.filter((item) => String(item?.url || '').trim())
})

const displayEmail = computed(() => footer.value.contactEmail || '')
const displayHotline = computed(() => footer.value.hotline || footer.value.phone || '')

const headerTop = ref(null)
const isHidden = ref(false)
let lastScrollTop = 0
let ticking = false

const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    if (scrollTop > 80) {
        if (scrollTop > lastScrollTop && scrollTop > 150) {
            isHidden.value = true
        } else if (scrollTop < lastScrollTop) {
            isHidden.value = false
        }
    } else {
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

.social-icon .fa-zalo {
    display: inline-block !important;
    width: 16px;
    height: 16px;
    background-color: white;
    background-image: url(/assets/icons/zalo.svg);
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    margin-top: 5px;
}

.social-icon:hover {
    color: #ffeb3b;
    transform: translateY(-2px);
}

.social-icon:hover .fa-zalo {
    background-color: #ffeb3b;
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
    text-decoration: none;
    color: white;
}

.email-info:hover,
.hotline-info:hover {
    color: #ffeb3b;
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

    .social-icon .fa-zalo {
        width: 14px;
        height: 14px;
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

    .social-icon .fa-zalo {
        width: 13px;
        height: 13px;
        margin-top: 4px;
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