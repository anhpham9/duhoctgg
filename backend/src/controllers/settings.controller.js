import db from "../config/db.js";
import { logError, logInfo, auditLog } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { SecurityLogger } from "../utils/securityLogger.js";
import {
    GENERAL_SETTINGS_KEYS,
    GENERAL_SETTINGS_DESCRIPTIONS,
    CONTACT_SETTINGS_KEYS,
    CONTACT_SETTINGS_DESCRIPTIONS,
    getGeneralSettingsData,
    getContactSettingsData
} from "../services/settings.service.js";
import {
    MEDIA_OWNER_TYPES,
    MEDIA_OWNER_KEYS,
    MEDIA_FIELD_NAMES,
    syncMediaAssetOwnership
} from "../services/mediaAsset.service.js";
import {
    DEFAULT_IMAGE_MIME_TYPES,
    validateImageUploadFile,
    uploadImageToCloudinary,
    deleteCloudinaryAssetByPublicId,
    deleteCloudinaryAssetsSafely,
    ensureCloudinaryReady
} from "../services/cmsAsset.service.js";

const MANAGE_SETTINGS_ROLES = [1, 2];
const ALLOWED_GENERAL_IMAGE_TYPES = new Set(["logo", "favicon"]);
const ALLOWED_IMAGE_MIME_TYPES = DEFAULT_IMAGE_MIME_TYPES;
const ALLOWED_FAVICON_MIME_TYPES = new Set([
    ...ALLOWED_IMAGE_MIME_TYPES,
    "image/x-icon",
    "image/vnd.microsoft.icon"
]);
const DEFAULT_LOGO_MAX_FILE_SIZE = 1 * 1024 * 1024;
const DEFAULT_FAVICON_MAX_FILE_SIZE = 512 * 1024;
const configuredLogoMaxFileSize = Number(process.env.CLOUDINARY_MAX_FILE_SIZE || DEFAULT_LOGO_MAX_FILE_SIZE);
const configuredFaviconMaxFileSize = Number(process.env.CLOUDINARY_FAVICON_MAX_FILE_SIZE || DEFAULT_FAVICON_MAX_FILE_SIZE);
const LOGO_MAX_FILE_SIZE = Number.isFinite(configuredLogoMaxFileSize) && configuredLogoMaxFileSize > 0
    ? configuredLogoMaxFileSize
    : DEFAULT_LOGO_MAX_FILE_SIZE;
const FAVICON_MAX_FILE_SIZE = Number.isFinite(configuredFaviconMaxFileSize) && configuredFaviconMaxFileSize > 0
    ? configuredFaviconMaxFileSize
    : DEFAULT_FAVICON_MAX_FILE_SIZE;
const ALLOWED_SITE_LANGUAGES = ["vi", "en", "ja"];
const ALLOWED_SITE_TIMEZONES = ["Asia/Ho_Chi_Minh", "Asia/Tokyo", "UTC"];
const ALLOWED_DATE_FORMATS = ["dd/mm/yyyy", "mm/dd/yyyy", "yyyy-mm-dd"];

const hasIcoExtension = (fileName = "") => String(fileName).trim().toLowerCase().endsWith(".ico");


export const getGeneralSettings = async (req, res) => {
    try {
        const currentUserRole = req.user?.role_id;
        const currentUserId = req.user?.id;

        if (!MANAGE_SETTINGS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                "/api/settings/general",
                "GET",
                "settings.general.view"
            );

            return res.status(403).json({
                success: false,
                message: "Truy cập bị từ chối. Bạn không thể xem cài đặt."
            });
        }

        res.json({
            success: true,
            data: await getGeneralSettingsData()
        });
    } catch (error) {
        logError("Get general settings failed", error, {
            requesterId: req.user?.id
        });

        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ"
        });
    }
};

export const updateGeneralSettings = async (req, res) => {
    const currentUserRole = req.user?.role_id;
    const currentUserId = req.user?.id;
    const publicIdsToDelete = [];

    try {
        if (!MANAGE_SETTINGS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                "/api/settings/general",
                "PUT",
                "settings.general.update"
            );

            return res.status(403).json({
                success: false,
                message: "Truy cập bị từ chối. Bạn không thể cập nhật cài đặt."
            });
        }

        const payload = InputSanitizer.sanitizeGeneralSettingsData(req.body || {});
        const incomingAssetPublicIds = {
            [MEDIA_FIELD_NAMES.siteLogoUrl]: String(req.body?.siteLogoAssetPublicId || "").trim(),
            [MEDIA_FIELD_NAMES.siteFaviconUrl]: String(req.body?.siteFaviconAssetPublicId || "").trim()
        };

        if (!payload.siteName) {
            return res.status(400).json({
                success: false,
                message: "Tên website là bắt buộc",
                errors: {
                    siteName: "Tên website là bắt buộc"
                }
            });
        }

        if (!ALLOWED_SITE_LANGUAGES.includes(payload.siteLanguage)) {
            return res.status(400).json({
                success: false,
                message: "Ngôn ngữ hệ thống không hợp lệ",
                errors: {
                    siteLanguage: "Ngôn ngữ hệ thống không hợp lệ"
                }
            });
        }

        if (!ALLOWED_SITE_TIMEZONES.includes(payload.siteTimezone)) {
            return res.status(400).json({
                success: false,
                message: "Múi giờ hệ thống không hợp lệ",
                errors: {
                    siteTimezone: "Múi giờ hệ thống không hợp lệ"
                }
            });
        }

        if (!ALLOWED_DATE_FORMATS.includes(payload.dateFormat)) {
            return res.status(400).json({
                success: false,
                message: "Định dạng ngày không hợp lệ",
                errors: {
                    dateFormat: "Định dạng ngày không hợp lệ"
                }
            });
        }

        await db.query("BEGIN");

        const settingsEntries = [
            [GENERAL_SETTINGS_KEYS.siteName,              String(payload.siteName)],
            [GENERAL_SETTINGS_KEYS.siteUrl,               String(payload.siteUrl)],
            [GENERAL_SETTINGS_KEYS.siteLogoUrl,           String(payload.siteLogoUrl)],
            [GENERAL_SETTINGS_KEYS.siteFaviconUrl,       String(payload.siteFaviconUrl)],
            [GENERAL_SETTINGS_KEYS.siteDescription,       String(payload.siteDescription)],
            [GENERAL_SETTINGS_KEYS.siteCopyright,       String(payload.siteCopyright)],
            [GENERAL_SETTINGS_KEYS.siteLanguage,        String(payload.siteLanguage)],
            [GENERAL_SETTINGS_KEYS.siteTimezone,        String(payload.siteTimezone)],
            [GENERAL_SETTINGS_KEYS.dateFormat,          String(payload.dateFormat)]
        ];

        const placeholders = settingsEntries
            .map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`)
            .join(",\n                ");

        const values = settingsEntries.flatMap(([key, value]) => [
            key,
            value,
            GENERAL_SETTINGS_DESCRIPTIONS[key] || "",
            "general"
        ]);

        await db.query(
            `INSERT INTO settings (key, value, description, group_name)
             VALUES
                ${placeholders}
             ON CONFLICT (key)
             DO UPDATE SET
                value = EXCLUDED.value,
                description = EXCLUDED.description,
                group_name = EXCLUDED.group_name`,
            values
        );

        const fieldMappings = [
            {
                fieldName: MEDIA_FIELD_NAMES.siteLogoUrl,
                payloadKey: "siteLogoUrl"
            },
            {
                fieldName: MEDIA_FIELD_NAMES.siteFaviconUrl,
                payloadKey: "siteFaviconUrl"
            }
        ];

        const ownershipSyncResult = await syncMediaAssetOwnership({
            ownerType: MEDIA_OWNER_TYPES.settings,
            ownerKey: MEDIA_OWNER_KEYS.general,
            fieldMappings,
            payload,
            incomingAssetPublicIds,
            userId: currentUserId,
            client: db
        });
        publicIdsToDelete.push(...ownershipSyncResult.publicIdsToDelete);

        await db.query("COMMIT");

        await deleteCloudinaryAssetsSafely(publicIdsToDelete, logError, {
            requesterId: currentUserId
        });

        auditLog("UPDATE_GENERAL_SETTINGS", currentUserId, {
            updatedFields: Object.keys(payload)
        }, req);

        logInfo("General settings updated", {
            updatedBy: currentUserId
        });

        res.json({
            success: true,
            message: "Đã cập nhật cài đặt chung thành công",
            data: payload
        });
    } catch (error) {
        try {
            await db.query("ROLLBACK");
        } catch (rollbackError) {
            logError("Rollback failed after update general settings error", rollbackError, {
                requesterId: currentUserId
            });
        }

        logError("Update general settings failed", error, {
            requesterId: currentUserId,
            targetData: req.body || {}
        });

        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ"
        });
    }
};

export const uploadGeneralImage = async (req, res) => {
    const currentUserRole = req.user?.role_id;
    const currentUserId = req.user?.id;

    try {
        if (!MANAGE_SETTINGS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                "/api/settings/general/upload-image",
                "POST",
                "settings.general.upload"
            );

            return res.status(403).json({
                success: false,
                message: "Truy cập bị từ chối. Bạn không thể upload ảnh cài đặt."
            });
        }

        ensureCloudinaryReady();

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn file ảnh để upload"
            });
        }

        const imageTypeRaw = String(req.body?.type || "logo").trim().toLowerCase();
        const imageType = ALLOWED_GENERAL_IMAGE_TYPES.has(imageTypeRaw) ? imageTypeRaw : "logo";
        const maxFileSize = imageType === "favicon" ? FAVICON_MAX_FILE_SIZE : LOGO_MAX_FILE_SIZE;

        const allowedMimeTypes = imageType === "favicon"
            ? [...ALLOWED_FAVICON_MIME_TYPES]
            : ALLOWED_IMAGE_MIME_TYPES;

        validateImageUploadFile({
            file: req.file,
            allowedMimeTypes,
            allowedExtensions: imageType === "favicon" && hasIcoExtension(req.file.originalname) ? [".ico"] : [],
            maxFileSize,
            imageLabel: imageType
        });

        const folderRoot = String(process.env.CLOUDINARY_FOLDER || "duhocNB").trim() || "duhocNB";

        const uploadResult = await uploadImageToCloudinary({
            file: req.file,
            folder: `${folderRoot}/settings/${imageType}`,
            transformation: [{ quality: "auto", fetch_format: "auto" }]
        });

        auditLog("UPLOAD_GENERAL_IMAGE", currentUserId, {
            imageType,
            publicId: uploadResult.publicId,
            bytes: uploadResult.bytes,
            format: uploadResult.format,
            originalName: req.file.originalname
        }, req);

        return res.json({
            success: true,
            message: "Upload ảnh thành công",
            data: {
                imageType,
                url: uploadResult.url,
                publicId: uploadResult.publicId,
                width: uploadResult.width,
                height: uploadResult.height,
                bytes: uploadResult.bytes,
                format: uploadResult.format
            }
        });
    } catch (error) {
        const isValidationError = String(error?.message || "").toLowerCase().includes("invalid")
            || String(error?.message || "").toLowerCase().includes("exceeds")
            || String(error?.message || "").toLowerCase().includes("please select");

        logError("Upload general image failed", error, {
            requesterId: currentUserId,
            imageType: req.body?.type
        });

        return res.status(isValidationError ? 400 : 500).json({
            success: false,
            message: error?.message || "Upload ảnh thất bại. Vui lòng thử lại sau."
        });
    }
};

export const deleteGeneralImage = async (req, res) => {
    const currentUserRole = req.user?.role_id;
    const currentUserId = req.user?.id;

    try {
        if (!MANAGE_SETTINGS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                "/api/settings/general/upload-image",
                "DELETE",
                "settings.general.delete_upload"
            );

            return res.status(403).json({
                success: false,
                message: "Truy cập bị từ chối. Bạn không thể xóa ảnh cài đặt."
            });
        }

        ensureCloudinaryReady();

        const publicId = String(req.body?.publicId || "").trim();
        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: "publicId là bắt buộc"
            });
        }

        const destroyResult = await deleteCloudinaryAssetByPublicId(publicId);

        auditLog("DELETE_GENERAL_IMAGE", currentUserId, {
            publicId,
            result: destroyResult?.result || "unknown"
        }, req);

        return res.json({
            success: true,
            message: "Đã xóa ảnh khỏi Cloudinary",
            data: {
                publicId,
                result: destroyResult?.result || "unknown"
            }
        });
    } catch (error) {
        logError("Delete general image failed", error, {
            requesterId: currentUserId,
            publicId: req.body?.publicId
        });

        return res.status(500).json({
            success: false,
            message: error?.message || "Không thể xóa ảnh khỏi Cloudinary"
        });
    }
};

export const getContactSettings = async (req, res) => {
    try {
        const currentUserRole = req.user?.role_id;
        const currentUserId = req.user?.id;

        if (!MANAGE_SETTINGS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                "/api/settings/contact",
                "GET",
                "settings.contact.view"
            );

            return res.status(403).json({
                success: false,
                message: "Truy cập bị từ chối. Bạn không thể xem cài đặt liên hệ."
            });
        }

        res.json({
            success: true,
            data: await getContactSettingsData()
        });
    } catch (error) {
        logError("Get contact settings failed", error, {
            requesterId: req.user?.id
        });

        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ"
        });
    }
};

export const updateContactSettings = async (req, res) => {
    const currentUserRole = req.user?.role_id;
    const currentUserId = req.user?.id;

    try {
        if (!MANAGE_SETTINGS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                "/api/settings/contact",
                "PUT",
                "settings.contact.update"
            );

            return res.status(403).json({
                success: false,
                message: "Truy cập bị từ chối. Bạn không thể cập nhật cài đặt liên hệ."
            });
        }

        const payload = InputSanitizer.sanitizeContactSettingsData(req.body || {});

        if (String(req.body?.contactEmail || "").trim() && !payload.contactEmail) {
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ",
                errors: {
                    contactEmail: "Email không hợp lệ"
                }
            });
        }

        if (String(req.body?.address || "").trim() && !payload.address) {
            return res.status(400).json({
                success: false,
                message: "Địa chỉ không hợp lệ",
                errors: {
                    address: "Địa chỉ không hợp lệ"
                }
            });
        }

        await db.query("BEGIN");

        const settingsEntries = [
            [CONTACT_SETTINGS_KEYS.companyFullName, String(payload.companyFullName)],
            [CONTACT_SETTINGS_KEYS.companyShortName, String(payload.companyShortName)],
            [CONTACT_SETTINGS_KEYS.contactEmail, String(payload.contactEmail)],
            [CONTACT_SETTINGS_KEYS.phone, String(payload.phone)],
            [CONTACT_SETTINGS_KEYS.hotline, String(payload.hotline)],
            [CONTACT_SETTINGS_KEYS.address, String(payload.address)],
            [CONTACT_SETTINGS_KEYS.googleMapEmbedUrl, String(payload.googleMapEmbedUrl)],
            [CONTACT_SETTINGS_KEYS.workingHours, String(payload.workingHours)]
        ];

        const placeholders = settingsEntries
            .map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`)
            .join(",\n                ");

        const values = settingsEntries.flatMap(([key, value]) => [
            key,
            value,
            CONTACT_SETTINGS_DESCRIPTIONS[key] || "",
            "contact"
        ]);

        await db.query(
            `INSERT INTO settings (key, value, description, group_name)
             VALUES
                ${placeholders}
             ON CONFLICT (key)
             DO UPDATE SET
                value = EXCLUDED.value,
                description = EXCLUDED.description,
                group_name = EXCLUDED.group_name`,
            values
        );

        await db.query("COMMIT");

        auditLog("UPDATE_CONTACT_SETTINGS", currentUserId, {
            updatedFields: Object.keys(payload)
        }, req);

        res.json({
            success: true,
            message: "Đã cập nhật cài đặt liên hệ thành công",
            data: payload
        });
    } catch (error) {
        try {
            await db.query("ROLLBACK");
        } catch (rollbackError) {
            logError("Rollback failed after update contact settings error", rollbackError, {
                requesterId: currentUserId
            });
        }

        logError("Update contact settings failed", error, {
            requesterId: currentUserId,
            targetData: req.body || {}
        });

        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ"
        });
    }
};
