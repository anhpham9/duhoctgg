<template>
    <div v-if="activeCampaign" class="popup-campaign-layer" :class="`position-${activeCampaign.position}`">
        <div v-if="showOverlay" class="popup-campaign-overlay" @click="closeCampaign"></div>

        <div class="popup-campaign-card" :class="{ fullscreen: activeCampaign.position === 'fullscreen' }">
            <button type="button" class="popup-close" @click="closeCampaign" aria-label="Đóng popup">
                <i class="fas fa-times"></i>
            </button>

            <a
                v-if="activeCampaign.link"
                :href="activeCampaign.link"
                target="_blank"
                rel="noopener noreferrer"
                class="popup-image-link"
            >
                <img :src="popupImage" :alt="activeCampaign.title || 'Popup quảng cáo'" class="popup-image" />
            </a>

            <img
                v-else
                :src="popupImage"
                :alt="activeCampaign.title || 'Popup quảng cáo'"
                class="popup-image"
            />
        </div>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const route = useRoute()
const config = useRuntimeConfig()

const campaigns = ref([])
const activeCampaign = ref(null)
const viewportWidth = ref(1024)

const allowedPages = new Set(['home', 'about', 'schools', 'news', 'contact', 'conditions'])

const routePage = computed(() => {
    const path = String(route.path || '/').toLowerCase()
    if (path === '/' || path === '') return 'home'

    const firstSegment = path.split('/').filter(Boolean)[0] || ''
    return allowedPages.has(firstSegment) ? firstSegment : 'all'
})

const popupImage = computed(() => {
    const item = activeCampaign.value
    if (!item) return ''

    const isMobile = viewportWidth.value < 768
    if (isMobile) return item.mobile_image || item.desktop_image || ''
    return item.desktop_image || item.mobile_image || ''
})

const showOverlay = computed(() => {
    const position = activeCampaign.value?.position
    return position === 'center' || position === 'fullscreen'
})

const getStorageKey = (campaign) => `popup_campaign_dismissed_${campaign.id}`

const getTodayKey = () => {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

const isDismissed = (campaign) => {
    if (!process.client || !campaign) return false

    const key = getStorageKey(campaign)

    if (campaign.close_type === 'session') {
        return sessionStorage.getItem(key) === '1'
    }

    if (campaign.close_type === 'day') {
        return localStorage.getItem(key) === getTodayKey()
    }

    return localStorage.getItem(key) === '1'
}

const markDismissed = (campaign) => {
    if (!process.client || !campaign) return

    const key = getStorageKey(campaign)

    if (campaign.close_type === 'session') {
        sessionStorage.setItem(key, '1')
        return
    }

    if (campaign.close_type === 'day') {
        localStorage.setItem(key, getTodayKey())
        return
    }

    localStorage.setItem(key, '1')
}

const pickActiveCampaign = () => {
    const next = campaigns.value.find((item) => !isDismissed(item)) || null
    activeCampaign.value = next
}

const fetchCampaigns = async () => {
    try {
        const result = await $fetch(`${config.public.apiBase}/public/popup-campaigns`, {
            method: 'GET',
            query: { page: routePage.value }
        })

        campaigns.value = Array.isArray(result?.data) ? result.data : []
        pickActiveCampaign()
    } catch {
        campaigns.value = []
        activeCampaign.value = null
    }
}

const closeCampaign = () => {
    if (!activeCampaign.value) return
    markDismissed(activeCampaign.value)
    pickActiveCampaign()
}

const handleResize = () => {
    viewportWidth.value = window.innerWidth || 1024
}

watch(routePage, async () => {
    await fetchCampaigns()
})

onMounted(async () => {
    handleResize()
    window.addEventListener('resize', handleResize)
    await fetchCampaigns()
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.popup-campaign-layer {
    position: fixed;
    inset: 0;
    z-index: 2100;
    pointer-events: none;
}

.popup-campaign-overlay {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    pointer-events: auto;
}

.popup-campaign-card {
    position: absolute;
    background: #fff;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.35);
    pointer-events: auto;
}

.popup-campaign-card.fullscreen {
    width: min(1200px, 94vw);
    max-height: 94vh;
}

.popup-close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background: rgba(15, 23, 42, 0.72);
    color: #fff;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.popup-close:hover {
    background: #0f172a;
}

.popup-image-link,
.popup-image {
    display: block;
    width: 100%;
}

.popup-image {
    max-width: 100%;
    height: auto;
}

.position-center .popup-campaign-card {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(920px, 92vw);
    max-height: 90vh;
}

.position-fullscreen .popup-campaign-card {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.position-fullscreen .popup-image {
    width: 100%;
    height: auto;
    max-height: 94vh;
    object-fit: contain;
}

.position-bottom-right .popup-campaign-card {
    right: 20px;
    bottom: 20px;
    width: min(380px, calc(100vw - 24px));
}

.position-bottom-left .popup-campaign-card {
    left: 20px;
    bottom: 20px;
    width: min(380px, calc(100vw - 24px));
}

.position-top-right .popup-campaign-card {
    right: 20px;
    top: 20px;
    width: min(380px, calc(100vw - 24px));
}

.position-top-left .popup-campaign-card {
    left: 20px;
    top: 20px;
    width: min(380px, calc(100vw - 24px));
}

@media (max-width: 767px) {
    .position-bottom-right .popup-campaign-card,
    .position-bottom-left .popup-campaign-card,
    .position-top-right .popup-campaign-card,
    .position-top-left .popup-campaign-card {
        width: calc(100vw - 24px);
        left: 12px;
        right: 12px;
    }

    .position-bottom-right .popup-campaign-card,
    .position-bottom-left .popup-campaign-card {
        bottom: 12px;
        top: auto;
    }

    .position-top-right .popup-campaign-card,
    .position-top-left .popup-campaign-card {
        top: 12px;
        bottom: auto;
    }
}
</style>
