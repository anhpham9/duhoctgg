import db from "../config/db.js";
import { logError, auditLog } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { NotificationService } from "../services/notification.service.js";
import { POPUP_CLOSE_TYPES, POPUP_PAGES, POPUP_POSITIONS } from "../services/popupCampaigns.service.js";
import {
    DEFAULT_IMAGE_MIME_TYPES,
    validateImageUploadFile,
    uploadImageToCloudinary,
    deleteCloudinaryAssetByPublicId,
    ensureCloudinaryReady
} from "../services/cmsAsset.service.js";

const MANAGE_ROLES = [1, 2];
const POPUP_IMAGE_TYPES = new Set(["desktop", "mobile"]);
const DEFAULT_POPUP_IMAGE_MAX_FILE_SIZE = 1 * 1024 * 1024;
const configuredPopupImageMaxFileSize = Number(process.env.CLOUDINARY_MAX_FILE_SIZE || DEFAULT_POPUP_IMAGE_MAX_FILE_SIZE);
const POPUP_IMAGE_MAX_FILE_SIZE = Number.isFinite(configuredPopupImageMaxFileSize) && configuredPopupImageMaxFileSize > 0
    ? configuredPopupImageMaxFileSize
    : DEFAULT_POPUP_IMAGE_MAX_FILE_SIZE;

const checkRole = (req, res) => {
    const role = Number(req.user?.role_id);
    if (MANAGE_ROLES.includes(role)) return true;

    auditLog("SECURITY_PERMISSION_VIOLATION", req.user?.id, {
        event: "permission_violation",
        resource: req.originalUrl,
        action: req.method,
        requiredPermission: "settings.popup_campaigns",
        ip: req.ip,
        severity: "medium"
    }, req);

    res.status(403).json({ success: false, message: "Truy cập bị từ chối." });
    return false;
};

const toIsoOrNull = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
};

const sanitizePayload = (data = {}) => ({
    title: InputSanitizer.sanitizeText(data.title || "", { maxLength: 255, escapeHtml: false }),
    desktop_image: InputSanitizer.sanitizeUrl(data.desktop_image || ""),
    mobile_image: InputSanitizer.sanitizeUrl(data.mobile_image || ""),
    link: InputSanitizer.sanitizeUrl(data.link || ""),
    page: InputSanitizer.sanitizeText(data.page || "", { maxLength: 50 }).toLowerCase(),
    position: InputSanitizer.sanitizeText(data.position || "", { maxLength: 50 }).toLowerCase(),
    priority: Number.isFinite(Number(data.priority)) ? Number(data.priority) : 0,
    is_active: InputSanitizer.sanitizeBoolean(data.is_active, true),
    start_at: toIsoOrNull(data.start_at),
    end_at: toIsoOrNull(data.end_at),
    close_type: InputSanitizer.sanitizeText(data.close_type || "", { maxLength: 20 }).toLowerCase()
});

const validatePayload = (payload = {}, rawData = {}) => {
    const errors = {};

    if (!payload.title) errors.title = "Tiêu đề popup là bắt buộc";
    if (!payload.desktop_image) errors.desktop_image = "Ảnh desktop là bắt buộc";
    if (!payload.page || !POPUP_PAGES.includes(payload.page)) errors.page = "Trang hiển thị không hợp lệ";
    if (!payload.position || !POPUP_POSITIONS.includes(payload.position)) errors.position = "Vị trí hiển thị không hợp lệ";
    if (!payload.close_type || !POPUP_CLOSE_TYPES.includes(payload.close_type)) errors.close_type = "Kiểu đóng popup không hợp lệ";

    const rawStartAt = rawData.start_at;
    const rawEndAt = rawData.end_at;
    const hasRawStartAt = rawStartAt !== null && rawStartAt !== undefined && String(rawStartAt).trim() !== "";
    const hasRawEndAt = rawEndAt !== null && rawEndAt !== undefined && String(rawEndAt).trim() !== "";

    if (hasRawStartAt && !payload.start_at) {
        errors.start_at = "Thời gian bắt đầu không hợp lệ";
    }

    if (hasRawEndAt && !payload.end_at) {
        errors.end_at = "Thời gian kết thúc không hợp lệ";
    }

    if (payload.start_at && payload.end_at) {
        const start = new Date(payload.start_at).getTime();
        const end = new Date(payload.end_at).getTime();
        if (end < start) {
            errors.end_at = "Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu";
        }
    }

    return errors;
};

export const getPopupCampaigns = async (req, res) => {
    try {
        if (!checkRole(req, res)) return;

        const result = await db.query(
            `SELECT id, title, desktop_image, mobile_image, link, page, position, priority,
                    is_active, start_at, end_at, close_type, created_at, updated_at
             FROM popup_campaigns
             ORDER BY priority DESC, id DESC`
        );

        return res.json({ success: true, data: result.rows });
    } catch (error) {
        logError("Get popup campaigns failed", error, { requesterId: req.user?.id });
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};

export const createPopupCampaign = async (req, res) => {
    try {
        if (!checkRole(req, res)) return;

        const payload = sanitizePayload(req.body || {});
        const errors = validatePayload(payload, req.body || {});
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu popup không hợp lệ",
                errors
            });
        }

        const result = await db.query(
            `INSERT INTO popup_campaigns (
                title, desktop_image, mobile_image, link, page, position,
                priority, is_active, start_at, end_at, close_type
            )
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
             RETURNING id, title, desktop_image, mobile_image, link, page, position,
                       priority, is_active, start_at, end_at, close_type, created_at, updated_at`,
            [
                payload.title,
                payload.desktop_image,
                payload.mobile_image || null,
                payload.link || null,
                payload.page,
                payload.position,
                payload.priority,
                payload.is_active,
                payload.start_at,
                payload.end_at,
                payload.close_type
            ]
        );

        const created = result.rows[0];

        auditLog("CREATE_POPUP_CAMPAIGN", req.user?.id, { popupCampaignId: created.id }, req);
        await NotificationService.notifySettingsChanged(
            "popup_campaigns.title",
            null,
            created.title,
            req.user?.id
        );

        return res.status(201).json({
            success: true,
            message: "Tạo popup quảng cáo thành công",
            data: created
        });
    } catch (error) {
        logError("Create popup campaign failed", error, { requesterId: req.user?.id });
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};

export const updatePopupCampaign = async (req, res) => {
    try {
        if (!checkRole(req, res)) return;

        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ success: false, message: "ID không hợp lệ" });
        }

        const payload = sanitizePayload(req.body || {});
        const errors = validatePayload(payload, req.body || {});
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu popup không hợp lệ",
                errors
            });
        }

        const result = await db.query(
            `UPDATE popup_campaigns
             SET title = $1,
                 desktop_image = $2,
                 mobile_image = $3,
                 link = $4,
                 page = $5,
                 position = $6,
                 priority = $7,
                 is_active = $8,
                 start_at = $9,
                 end_at = $10,
                 close_type = $11,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $12
             RETURNING id, title, desktop_image, mobile_image, link, page, position,
                       priority, is_active, start_at, end_at, close_type, created_at, updated_at`,
            [
                payload.title,
                payload.desktop_image,
                payload.mobile_image || null,
                payload.link || null,
                payload.page,
                payload.position,
                payload.priority,
                payload.is_active,
                payload.start_at,
                payload.end_at,
                payload.close_type,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy popup quảng cáo" });
        }

        const updated = result.rows[0];
        auditLog("UPDATE_POPUP_CAMPAIGN", req.user?.id, { popupCampaignId: id }, req);

        await NotificationService.notifySettingsChanged(
            "popup_campaigns.title",
            null,
            updated.title,
            req.user?.id
        );

        return res.json({
            success: true,
            message: "Cập nhật popup quảng cáo thành công",
            data: updated
        });
    } catch (error) {
        logError("Update popup campaign failed", error, { requesterId: req.user?.id });
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};

export const deletePopupCampaign = async (req, res) => {
    try {
        if (!checkRole(req, res)) return;

        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ success: false, message: "ID không hợp lệ" });
        }

        const result = await db.query(
            `DELETE FROM popup_campaigns
             WHERE id = $1
             RETURNING id, title`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy popup quảng cáo" });
        }

        const deleted = result.rows[0];
        auditLog("DELETE_POPUP_CAMPAIGN", req.user?.id, { popupCampaignId: id }, req);

        await NotificationService.notifySettingsChanged(
            "popup_campaigns.title",
            deleted.title,
            null,
            req.user?.id
        );

        return res.json({ success: true, message: "Đã xóa popup quảng cáo" });
    } catch (error) {
        logError("Delete popup campaign failed", error, { requesterId: req.user?.id });
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};

export const uploadPopupCampaignImage = async (req, res) => {
    try {
        if (!checkRole(req, res)) return;

        ensureCloudinaryReady();

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn file ảnh để upload"
            });
        }

        const imageTypeRaw = String(req.body?.type || "desktop").trim().toLowerCase();
        const imageType = POPUP_IMAGE_TYPES.has(imageTypeRaw) ? imageTypeRaw : "desktop";

        validateImageUploadFile({
            file: req.file,
            allowedMimeTypes: DEFAULT_IMAGE_MIME_TYPES,
            maxFileSize: POPUP_IMAGE_MAX_FILE_SIZE,
            imageLabel: `popup-${imageType}`
        });

        const folderRoot = String(process.env.CLOUDINARY_FOLDER || "duhocNB").trim() || "duhocNB";
        const uploadResult = await uploadImageToCloudinary({
            file: req.file,
            folder: `${folderRoot}/popup-campaigns/${imageType}`,
            transformation: [{ quality: "auto", fetch_format: "auto" }]
        });

        auditLog("UPLOAD_POPUP_CAMPAIGN_IMAGE", req.user?.id, {
            imageType,
            publicId: uploadResult.publicId,
            bytes: uploadResult.bytes,
            format: uploadResult.format,
            originalName: req.file.originalname
        }, req);

        return res.json({
            success: true,
            message: "Upload ảnh popup thành công",
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
        const lowerMessage = String(error?.message || "").toLowerCase();
        const isValidationError = lowerMessage.includes("invalid")
            || lowerMessage.includes("exceeds")
            || lowerMessage.includes("please select");

        logError("Upload popup campaign image failed", error, {
            requesterId: req.user?.id,
            imageType: req.body?.type
        });

        return res.status(isValidationError ? 400 : 500).json({
            success: false,
            message: error?.message || "Upload ảnh popup thất bại. Vui lòng thử lại sau."
        });
    }
};

export const deletePopupCampaignImage = async (req, res) => {
    try {
        if (!checkRole(req, res)) return;

        ensureCloudinaryReady();

        const publicId = String(req.body?.publicId || "").trim();
        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: "publicId là bắt buộc"
            });
        }

        const destroyResult = await deleteCloudinaryAssetByPublicId(publicId);

        auditLog("DELETE_POPUP_CAMPAIGN_IMAGE", req.user?.id, {
            publicId,
            result: destroyResult?.result || "unknown"
        }, req);

        return res.json({
            success: true,
            message: "Đã xóa ảnh popup khỏi Cloudinary",
            data: {
                publicId,
                result: destroyResult?.result || "unknown"
            }
        });
    } catch (error) {
        logError("Delete popup campaign image failed", error, {
            requesterId: req.user?.id,
            publicId: req.body?.publicId
        });

        return res.status(500).json({
            success: false,
            message: error?.message || "Không thể xóa ảnh popup khỏi Cloudinary"
        });
    }
};

export const getPublicPopupCampaigns = async (req, res) => {
    try {
        const page = String(req.query.page || "all").trim().toLowerCase();
        const normalizedPage = POPUP_PAGES.includes(page) ? page : "all";

        const result = await db.query(
            `SELECT id, title, desktop_image, mobile_image, link, page, position, priority,
                    close_type, start_at, end_at
             FROM popup_campaigns
             WHERE is_active = TRUE
               AND (start_at IS NULL OR start_at <= NOW())
               AND (end_at IS NULL OR end_at >= NOW())
               AND (page = 'all' OR page = $1)
             ORDER BY priority DESC, id DESC
             LIMIT 20`,
            [normalizedPage]
        );

        return res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logError("Get public popup campaigns failed", error, { ip: req.ip });
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};
