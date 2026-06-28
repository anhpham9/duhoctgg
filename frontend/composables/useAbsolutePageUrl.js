import { computed, unref } from 'vue'

const normalizeBaseUrl = (value) => String(value || '').trim().replace(/\/+$/, '')

const normalizePath = (value) => {
    const rawPath = String(value || '/').trim()
    if (!rawPath) return '/'
    return rawPath.startsWith('/') ? rawPath : `/${rawPath}`
}

export const useAbsolutePageUrl = (options = {}) => {
    const route = useRoute()
    const requestUrl = useRequestURL()

    const resolvedBaseUrl = computed(() => {
        const customBaseUrl = typeof options.baseUrl === 'function'
            ? options.baseUrl()
            : unref(options.baseUrl)

        const normalizedCustomBaseUrl = normalizeBaseUrl(customBaseUrl)
        if (normalizedCustomBaseUrl) return normalizedCustomBaseUrl

        return normalizeBaseUrl(requestUrl.origin)
    })

    const resolvedPath = computed(() => {
        const customPath = typeof options.path === 'function'
            ? options.path()
            : unref(options.path)

        const activePath = customPath ?? route.path
        return normalizePath(activePath)
    })

    return computed(() => {
        const baseUrl = resolvedBaseUrl.value
        const path = resolvedPath.value

        if (!baseUrl) return path
        if (path === '/') return baseUrl

        return `${baseUrl}${path}`
    })
}