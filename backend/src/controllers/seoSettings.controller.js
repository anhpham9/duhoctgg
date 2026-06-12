import db from "../config/db.js";
import { logError, auditLog } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { SecurityLogger } from "../utils/securityLogger.js";

const MANAGE_SETTINGS_ROLES = [1, 2];
const SEO_SETTINGS_PREFIX = "seo.";

const SEO_SETTINGS_KEYS = {
    seoDefaultTitle: `${SEO_SETTINGS_PREFIX}default_title`,
    seoDefaultDescription: `${SEO_SETTINGS_PREFIX}default_description`,
    seoDefaultOgImage: `${SEO_SETTINGS_PREFIX}default_og_image`,
    seoFacebookAppId: `${SEO_SETTINGS_PREFIX}facebook_app_id`,
    seoTwitterHandle: `${SEO_SETTINGS_PREFIX}twitter_handle`
};

const SEO_SETTINGS_DESCRIPTIONS = {
    [SEO_SETTINGS_KEYS.seoDefaultTitle]: "SEO setting: default page title",
    [SEO_SETTINGS_KEYS.seoDefaultDescription]: "SEO setting: default meta description",
    [SEO_SETTINGS_KEYS.seoDefaultOgImage]: "SEO setting: default Open Graph image URL",
    [SEO_SETTINGS_KEYS.seoFacebookAppId]: "SEO setting: Facebook App ID",
    [SEO_SETTINGS_KEYS.seoTwitterHandle]: "SEO setting: Twitter handle"
};

const getDefaultSeoSettings = () => ({
    seoDefaultTitle: "",
    seoDefaultDescription: "",
    seoDefaultOgImage: "",
    seoFacebookAppId: "",
    seoTwitterHandle: ""
});

const mapRowsToSeoSettings = (rows = []) => {
    const data = getDefaultSeoSettings();
    for (const row of rows) {
        if (row.key === SEO_SETTINGS_KEYS.seoDefaultTitle) data.seoDefaultTitle = row.value || "";
        if (row.key === SEO_SETTINGS_KEYS.seoDefaultDescription) data.seoDefaultDescription = row.value || "";
        if (row.key === SEO_SETTINGS_KEYS.seoDefaultOgImage) data.seoDefaultOgImage = row.value || "";
        if (row.key === SEO_SETTINGS_KEYS.seoFacebookAppId) data.seoFacebookAppId = row.value || "";
        if (row.key === SEO_SETTINGS_KEYS.seoTwitterHandle) data.seoTwitterHandle = row.value || "";
    }
    return data;
};

const checkRole = (req, res, endpoint) => {
    const role = Number(req.user?.role_id);
    if (MANAGE_SETTINGS_ROLES.includes(role)) return true;
    SecurityLogger.logPermissionViolation(req.user?.id, req.ip, endpoint, req.method, "settings.seo");
    res.status(403).json({ success: false, message: "Truy cập bị từ chối." });
    return false;
};

export const getSeoSettings = async (req, res) => {
    try {
        if (!checkRole(req, res, "/api/settings/seo")) return;
        const keys = Object.values(SEO_SETTINGS_KEYS);
        const result = await db.query(
            `SELECT key, value FROM settings WHERE key = ANY($1::text[])`,
            [keys]
        );
        res.json({ success: true, data: mapRowsToSeoSettings(result.rows) });
    } catch (error) {
        logError("Get SEO settings failed", error, { requesterId: req.user?.id });
        res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};

export const updateSeoSettings = async (req, res) => {
    try {
        if (!checkRole(req, res, "/api/settings/seo")) return;

        const payload = {
            seoDefaultTitle: InputSanitizer.sanitizeText(req.body?.seoDefaultTitle || "", { maxLength: 255, escapeHtml: false }),
            seoDefaultDescription: InputSanitizer.sanitizeText(req.body?.seoDefaultDescription || "", { maxLength: 2000, escapeHtml: false }),
            seoDefaultOgImage: InputSanitizer.sanitizeUrl(req.body?.seoDefaultOgImage || ""),
            seoFacebookAppId: InputSanitizer.sanitizeText(req.body?.seoFacebookAppId || "", { maxLength: 100, escapeHtml: true }),
            seoTwitterHandle: InputSanitizer.sanitizeText(req.body?.seoTwitterHandle || "", { maxLength: 100, escapeHtml: true })
        };

        await db.query("BEGIN");

        const settingsEntries = [
            [SEO_SETTINGS_KEYS.seoDefaultTitle, String(payload.seoDefaultTitle)],
            [SEO_SETTINGS_KEYS.seoDefaultDescription, String(payload.seoDefaultDescription)],
            [SEO_SETTINGS_KEYS.seoDefaultOgImage, String(payload.seoDefaultOgImage)],
            [SEO_SETTINGS_KEYS.seoFacebookAppId, String(payload.seoFacebookAppId)],
            [SEO_SETTINGS_KEYS.seoTwitterHandle, String(payload.seoTwitterHandle)]
        ];

        const placeholders = settingsEntries.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(",");
        const values = settingsEntries.flatMap(([key, value]) => [key, value, SEO_SETTINGS_DESCRIPTIONS[key] || ""]);

        await db.query(
            `INSERT INTO settings (key, value, description) VALUES ${placeholders}
             ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description`,
            values
        );

        await db.query("COMMIT");
        auditLog("UPDATE_SEO_SETTINGS", req.user?.id, { fields: Object.keys(payload) }, req);
        res.json({ success: true, message: "Đã cập nhật cài đặt SEO thành công", data: payload });
    } catch (error) {
        try { await db.query("ROLLBACK"); } catch (rollbackError) {}
        logError("Update SEO settings failed", error, { requesterId: req.user?.id });
        res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};