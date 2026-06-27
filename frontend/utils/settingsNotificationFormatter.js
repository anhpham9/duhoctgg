const SETTINGS_FIELD_LABELS = Object.freeze({
    // General settings
    'general.site_name': 'Tên website',
    'general.site_url': 'Website URL',
    'general.site_logo_url': 'Logo URL',
    'general.site_favicon_url': 'Favicon URL',
    'general.site_description': 'Mô tả website',
    'general.site_copyright': 'Bản quyền',
    'general.site_language': 'Ngôn ngữ hệ thống',
    'general.site_timezone': 'Múi giờ hệ thống',
    'general.date_format': 'Định dạng ngày',
    'general.site_logo_asset_public_id': 'Mã asset Logo',
    'general.site_favicon_asset_public_id': 'Mã asset Favicon',

    // Contact settings
    'contact.company_full_name': 'Tên công ty đầy đủ',
    'contact.company_short_name': 'Tên công ty dạng ngắn',
    'contact.contact_email': 'Email liên hệ',
    'contact.phone': 'Số điện thoại công ty',
    'contact.hotline': 'Hotline công ty',
    'contact.address': 'Địa chỉ công ty',
    'contact.google_map_embed_url': 'Google Maps embed URL',
    'contact.working_hours': 'Giờ làm việc',

    // SEO settings
    'seo.seo_default_title': 'SEO Title mặc định',
    'seo.seo_default_description': 'SEO Description mặc định',
    'seo.seo_default_og_image': 'Default OG Image URL',
    'seo.seo_facebook_app_id': 'Facebook App ID',

    // Social links settings
    'socials.name': 'Tên liên kết',
    'socials.icon': 'Icon',
    'socials.url': 'URL',
    'socials.description': 'Mô tả',
    'socials.display_order': 'Thứ tự hiển thị',
    'socials.is_active': 'Trạng thái kích hoạt',

    // Backup settings
    'backups.enabled': 'Bật backup tự động',
    'backups.frequency': 'Tần suất backup',
    'backups.run_at': 'Thời gian chạy mỗi ngày',
    'backups.retention_count': 'Số lượng bản lưu',
    'backups.backup_file': 'File backup',
    'backups.backup_id': 'Mã backup',

    // settings.* prefix variants
    'settings.general.site_name': 'Tên website',
    'settings.general.site_url': 'Website URL',
    'settings.general.site_logo_url': 'Logo URL',
    'settings.general.site_favicon_url': 'Favicon URL',
    'settings.general.site_description': 'Mô tả website',
    'settings.general.site_copyright': 'Bản quyền',
    'settings.general.site_language': 'Ngôn ngữ hệ thống',
    'settings.general.site_timezone': 'Múi giờ hệ thống',
    'settings.general.date_format': 'Định dạng ngày',
    'settings.general.site_logo_asset_public_id': 'Mã asset Logo',
    'settings.general.site_favicon_asset_public_id': 'Mã asset Favicon',

    'settings.contact.company_full_name': 'Tên công ty đầy đủ',
    'settings.contact.company_short_name': 'Tên công ty dạng ngắn',
    'settings.contact.contact_email': 'Email liên hệ',
    'settings.contact.phone': 'Số điện thoại công ty',
    'settings.contact.hotline': 'Hotline công ty',
    'settings.contact.address': 'Địa chỉ công ty',
    'settings.contact.google_map_embed_url': 'Google Maps embed URL',
    'settings.contact.working_hours': 'Giờ làm việc',

    'settings.seo.seo_default_title': 'SEO Title mặc định',
    'settings.seo.seo_default_description': 'SEO Description mặc định',
    'settings.seo.seo_default_og_image': 'Default OG Image URL',
    'settings.seo.seo_facebook_app_id': 'Facebook App ID',

    'settings.socials.name': 'Tên liên kết',
    'settings.socials.icon': 'Icon',
    'settings.socials.url': 'URL',
    'settings.socials.description': 'Mô tả',
    'settings.socials.display_order': 'Thứ tự hiển thị',
    'settings.socials.is_active': 'Trạng thái kích hoạt',

    'settings.backups.enabled': 'Bật backup tự động',
    'settings.backups.frequency': 'Tần suất backup',
    'settings.backups.run_at': 'Thời gian chạy mỗi ngày',
    'settings.backups.retention_count': 'Số lượng bản lưu',
    'settings.backups.backup_file': 'File backup',
    'settings.backups.backup_id': 'Mã backup'
})

const SETTINGS_STANDALONE_FIELD_LABELS = Object.freeze({
    siteName: 'Tên website',
    site_name: 'Tên website',
    siteUrl: 'Website URL',
    site_url: 'Website URL',
    siteLogoUrl: 'Logo URL',
    site_logo_url: 'Logo URL',
    siteFaviconUrl: 'Favicon URL',
    site_favicon_url: 'Favicon URL',
    siteDescription: 'Mô tả website',
    site_description: 'Mô tả website',
    siteCopyright: 'Bản quyền',
    site_copyright: 'Bản quyền',
    siteLanguage: 'Ngôn ngữ hệ thống',
    site_language: 'Ngôn ngữ hệ thống',
    siteTimezone: 'Múi giờ hệ thống',
    site_timezone: 'Múi giờ hệ thống',
    dateFormat: 'Định dạng ngày',
    date_format: 'Định dạng ngày',
    siteLogoAssetPublicId: 'Mã asset Logo',
    site_logo_asset_public_id: 'Mã asset Logo',
    siteFaviconAssetPublicId: 'Mã asset Favicon',
    site_favicon_asset_public_id: 'Mã asset Favicon',

    companyFullName: 'Tên công ty đầy đủ',
    company_full_name: 'Tên công ty đầy đủ',
    companyShortName: 'Tên công ty dạng ngắn',
    company_short_name: 'Tên công ty dạng ngắn',
    contactEmail: 'Email liên hệ',
    contact_email: 'Email liên hệ',
    phone: 'Số điện thoại công ty',
    hotline: 'Hotline công ty',
    address: 'Địa chỉ công ty',
    googleMapEmbedUrl: 'Google Maps embed URL',
    google_map_embed_url: 'Google Maps embed URL',
    workingHours: 'Giờ làm việc',
    working_hours: 'Giờ làm việc',

    seoDefaultTitle: 'SEO Title mặc định',
    seo_default_title: 'SEO Title mặc định',
    seoDefaultDescription: 'SEO Description mặc định',
    seo_default_description: 'SEO Description mặc định',
    seoDefaultOgImage: 'Default OG Image URL',
    seo_default_og_image: 'Default OG Image URL',
    seoFacebookAppId: 'Facebook App ID',
    seo_facebook_app_id: 'Facebook App ID',

    name: 'Tên liên kết',
    icon: 'Icon',
    url: 'URL',
    description: 'Mô tả',
    display_order: 'Thứ tự hiển thị',
    displayOrder: 'Thứ tự hiển thị',
    is_active: 'Trạng thái kích hoạt',
    isActive: 'Trạng thái kích hoạt',

    enabled: 'Bật backup tự động',
    frequency: 'Tần suất backup',
    runAt: 'Thời gian chạy mỗi ngày',
    run_at: 'Thời gian chạy mỗi ngày',
    retentionCount: 'Số lượng bản lưu',
    retention_count: 'Số lượng bản lưu',
    backupFile: 'File backup',
    backup_file: 'File backup',
    backupId: 'Mã backup',
    backup_id: 'Mã backup'
})

export const formatSettingsNotificationMessage = (message) => {
    const rawMessage = String(message || '').trim()
    if (!rawMessage) return rawMessage

    const replacedPrefixedKeys = rawMessage.replace(/\b(?:settings\.)?(?:general|contact|seo|socials|backups)\.[a-z0-9_]+\b/gi, (fieldKey) => {
        const rawFieldKey = String(fieldKey || '')
        return SETTINGS_FIELD_LABELS[rawFieldKey] || SETTINGS_FIELD_LABELS[rawFieldKey.toLowerCase()] || fieldKey
    })

    return replacedPrefixedKeys.replace(/\b[A-Za-z][A-Za-z0-9_]*\b/g, (fieldKey) => {
        return SETTINGS_STANDALONE_FIELD_LABELS[fieldKey] || fieldKey
    })
}
