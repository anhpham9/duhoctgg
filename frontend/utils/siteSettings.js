const SITE_SETTINGS_STORAGE_KEY = 'duhocnb_site_settings'

const DEFAULT_SITE_SETTINGS = {
    siteLanguage: 'vi',
    siteTimezone: 'Asia/Ho_Chi_Minh',
    dateFormat: 'dd/mm/yyyy'
}

const ALLOWED_SITE_LANGUAGES = ['vi', 'en', 'ja']
const ALLOWED_SITE_TIMEZONES = ['Asia/Ho_Chi_Minh', 'Asia/Tokyo', 'UTC']
const ALLOWED_DATE_FORMATS = ['dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd']

const normalizeSiteSettings = (raw = {}) => {
    const normalized = {
        siteLanguage: String(raw.siteLanguage || DEFAULT_SITE_SETTINGS.siteLanguage).toLowerCase(),
        siteTimezone: String(raw.siteTimezone || DEFAULT_SITE_SETTINGS.siteTimezone),
        dateFormat: String(raw.dateFormat || DEFAULT_SITE_SETTINGS.dateFormat).toLowerCase()
    }

    if (!ALLOWED_SITE_LANGUAGES.includes(normalized.siteLanguage)) {
        normalized.siteLanguage = DEFAULT_SITE_SETTINGS.siteLanguage
    }

    if (!ALLOWED_SITE_TIMEZONES.includes(normalized.siteTimezone)) {
        normalized.siteTimezone = DEFAULT_SITE_SETTINGS.siteTimezone
    }

    if (!ALLOWED_DATE_FORMATS.includes(normalized.dateFormat)) {
        normalized.dateFormat = DEFAULT_SITE_SETTINGS.dateFormat
    }

    return normalized
}

export const getDefaultSiteSettings = () => ({ ...DEFAULT_SITE_SETTINGS })

export const persistClientSiteSettings = (settings = {}) => {
    const normalized = normalizeSiteSettings(settings)

    if (!process.client) {
        return normalized
    }

    try {
        localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(normalized))
    } catch {
        // Ignore storage write failures in restricted environments.
    }

    return normalized
}

export const getClientSiteSettings = () => {
    if (!process.client) {
        return getDefaultSiteSettings()
    }

    try {
        const raw = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY)
        if (!raw) {
            return getDefaultSiteSettings()
        }

        return normalizeSiteSettings(JSON.parse(raw))
    } catch {
        return getDefaultSiteSettings()
    }
}
