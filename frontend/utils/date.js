import { getClientSiteSettings } from '~/utils/siteSettings'

const LANGUAGE_TO_LOCALE = {
    vi: 'vi-VN',
    en: 'en-US',
    ja: 'ja-JP'
}

const RELATIVE_TEXT = {
    vi: {
        justNow: 'Vừa xong',
        minuteAgo: (value) => `${value} phút trước`,
        hourAgo: (value) => `${value} giờ trước`
    },
    en: {
        justNow: 'Just now',
        minuteAgo: (value) => `${value} minute${value === 1 ? '' : 's'} ago`,
        hourAgo: (value) => `${value} hour${value === 1 ? '' : 's'} ago`
    },
    ja: {
        justNow: 'たった今',
        minuteAgo: (value) => `${value}分前`,
        hourAgo: (value) => `${value}時間前`
    }
}

const getCurrentSiteLocaleConfig = () => {
    const { siteLanguage, siteTimezone, dateFormat } = getClientSiteSettings()
    const language = RELATIVE_TEXT[siteLanguage] ? siteLanguage : 'vi'

    return {
        language,
        locale: LANGUAGE_TO_LOCALE[language],
        siteTimezone,
        dateFormat
    }
}

const normalizeDate = (dateString) => {
    const date = new Date(dateString)
    return Number.isNaN(date.getTime()) ? null : date
}

const getDateParts = (date, locale, timeZone) => {
    const formatter = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone
    })

    const parts = formatter.formatToParts(date)
    const map = {
        year: '',
        month: '',
        day: '',
        hour: '',
        minute: ''
    }

    parts.forEach((part) => {
        if (Object.prototype.hasOwnProperty.call(map, part.type)) {
            map[part.type] = part.value
        }
    })

    return map
}

const formatDateByPattern = (parts, pattern) => {
    const datePart = pattern === 'mm/dd/yyyy'
        ? `${parts.month}/${parts.day}/${parts.year}`
        : pattern === 'yyyy-mm-dd'
            ? `${parts.year}-${parts.month}-${parts.day}`
            : `${parts.day}/${parts.month}/${parts.year}`

    return `${parts.hour}:${parts.minute} ${datePart}`
}

export function formatDate(dateString) {
    if (!dateString) return '-'

    try {
        const date = normalizeDate(dateString)
        if (!date) return '-'

        const { locale, siteTimezone, dateFormat } = getCurrentSiteLocaleConfig()
        const parts = getDateParts(date, locale, siteTimezone)

        return formatDateByPattern(parts, dateFormat)
    } catch {
        return '-'
    }
}

export function formatSmartDate(dateString) {
    if (!dateString) return '-'

    try {
        const date = normalizeDate(dateString)
        if (!date) return '-'

        const now = new Date()
        const diffMs = now - date
        const diffSec = Math.floor(diffMs / 1000)
        const diffMin = Math.floor(diffSec / 60)
        const diffHour = Math.floor(diffMin / 60)
        const { language } = getCurrentSiteLocaleConfig()
        const text = RELATIVE_TEXT[language]

        if (diffMin < 1) return text.justNow
        if (diffMin < 60) return text.minuteAgo(diffMin)
        if (diffHour < 24) return text.hourAgo(diffHour)

        return formatDate(dateString)
    } catch {
        return '-'
    }
}