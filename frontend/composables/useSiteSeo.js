import { computed } from 'vue'

const getDefaultSeo = () => ({
    siteName: '',
    siteUrl: '',
    defaultTitle: '',
    defaultDescription: '',
    defaultOgImage: '',
    facebookAppId: ''
})

export const useSiteSeoData = () => {
    const config = useRuntimeConfig()

    // Chỉ chịu trách nhiệm lấy dữ liệu thô + trạng thái async
    return useFetch(`${config.public.apiBase}/public/seo-settings`, {
        key: 'public-seo-settings'
    })
}

export const useSiteSeoComputed = (seoResponseRef) => {
    // Chỉ chịu trách nhiệm map + fallback dữ liệu đã fetch
    return computed(() => {
        const seoData = seoResponseRef.value?.data || {}

        return {
            siteName: seoData.siteName || '',
            siteUrl: seoData.siteUrl || '',
            defaultTitle: seoData.defaultTitle || '',
            defaultDescription: seoData.defaultDescription || '',
            defaultOgImage: seoData.defaultOgImage || '',
            facebookAppId: seoData.facebookAppId || ''
        }
    })
}

// Wrapper để giữ DX gọn và tương thích code cũ
export const useSiteSeo = () => {
    const { data, pending, error, refresh, status } = useSiteSeoData()
    const seo = useSiteSeoComputed(data)

    return {
        seo,
        pending,
        error,
        refresh,
        status
    }
}