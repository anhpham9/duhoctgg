import db from "../config/db.js";
import { logError, auditLog } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { NotificationService } from "../services/notification.service.js";

const MANAGE_ROLES = [1, 2];

const checkRole = (req, res) => {
    const role = Number(req.user?.role_id);
    if (MANAGE_ROLES.includes(role)) return true;
    auditLog('SECURITY_PERMISSION_VIOLATION', req.user?.id, {
        event: 'permission_violation',
        resource: req.originalUrl,
        action: req.method,
        requiredPermission: 'settings.social',
        ip: req.ip,
        severity: 'medium'
    }, req);
    res.status(403).json({ success: false, message: "Truy cập bị từ chối." });
    return false;
};

const sanitizeLink = (data = {}) => ({
    name: InputSanitizer.sanitizeText(data.name || "", { maxLength: 100, escapeHtml: false }),
    icon: InputSanitizer.sanitizeText(data.icon || "", { maxLength: 100, escapeHtml: true }),
    url: InputSanitizer.sanitizeUrl(data.url || ""),
    description: InputSanitizer.sanitizeText(data.description || "", { maxLength: 500, escapeHtml: false }),
    display_order: Math.max(0, Number(data.display_order) || 0),
    is_active: InputSanitizer.sanitizeBoolean(data.is_active, true)
});

export const getSocialLinks = async (req, res) => {
    try {
        if (!checkRole(req, res)) return;
        const result = await db.query(
            `SELECT id, name, icon, url, description, display_order, is_active, created_at, updated_at
             FROM social_links
             ORDER BY display_order ASC, id ASC`
        );
        return res.json({ success: true, data: result.rows });
    } catch (error) {
        logError("Get social links failed", error, { requesterId: req.user?.id });
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};

export const createSocialLink = async (req, res) => {
    try {
        if (!checkRole(req, res)) return;

        const link = sanitizeLink(req.body);

        if (!link.name || !link.url) {
            return res.status(400).json({
                success: false,
                message: "Tên và URL là bắt buộc",
                errors: {
                    name: !link.name ? "Tên mạng xã hội là bắt buộc" : "",
                    url: !link.url ? "URL là bắt buộc" : ""
                }
            });
        }

        const result = await db.query(
            `INSERT INTO social_links (name, icon, url, description, display_order, is_active, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, name, icon, url, description, display_order, is_active, created_at`,
            [link.name, link.icon, link.url, link.description, link.display_order, link.is_active, req.user?.id]
        );

        auditLog("CREATE_SOCIAL_LINK", req.user?.id, { linkId: result.rows[0].id, name: link.name }, req);

        // 🔔 NOTIFY: Thông báo cho admin khi thêm mới social link
        await NotificationService.notifySettingsChanged(
            `social_link_${result.rows[0].id}`,
            null,
            { name: link.name, url: link.url, icon: link.icon },
            req.user?.id
        );

        return res.status(201).json({ success: true, message: "Tạo liên kết mạng xã hội thành công", data: result.rows[0] });
    } catch (error) {
        logError("Create social link failed", error, { requesterId: req.user?.id });
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};

export const updateSocialLink = async (req, res) => {
    try {
        if (!checkRole(req, res)) return;

        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ success: false, message: "ID không hợp lệ" });
        }

        const link = sanitizeLink(req.body);

        if (!link.name || !link.url) {
            return res.status(400).json({
                success: false,
                message: "Tên và URL là bắt buộc",
                errors: {
                    name: !link.name ? "Tên mạng xã hội là bắt buộc" : "",
                    url: !link.url ? "URL là bắt buộc" : ""
                }
            });
        }

        const result = await db.query(
            `UPDATE social_links
             SET name = $1, icon = $2, url = $3, description = $4,
                 display_order = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
             WHERE id = $7
             RETURNING id, name, icon, url, description, display_order, is_active, updated_at`,
            [link.name, link.icon, link.url, link.description, link.display_order, link.is_active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy liên kết" });
        }

        auditLog("UPDATE_SOCIAL_LINK", req.user?.id, { linkId: id, name: link.name }, req);

        // 🔔 NOTIFY: Thông báo cho admin khi thay đổi social link
        await NotificationService.notifySettingsChanged(
            `social_link_${id}`,
            null,
            { name: link.name, url: link.url, icon: link.icon },
            req.user?.id
        );

        return res.json({ success: true, message: "Cập nhật thành công", data: result.rows[0] });
    } catch (error) {
        logError("Update social link failed", error, { requesterId: req.user?.id });
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};

export const deleteSocialLink = async (req, res) => {
    try {
        if (!checkRole(req, res)) return;

        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ success: false, message: "ID không hợp lệ" });
        }

        const result = await db.query(
            "DELETE FROM social_links WHERE id = $1 RETURNING id, name",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy liên kết" });
        }

        auditLog("DELETE_SOCIAL_LINK", req.user?.id, { linkId: id, name: result.rows[0].name }, req);

        // 🔔 NOTIFY: Thông báo cho admin khi xóa social link
        await NotificationService.notifySettingsChanged(
            `social_link_${id}`,
            { name: result.rows[0].name },
            null,
            req.user?.id
        );

        return res.json({ success: true, message: "Đã xoá liên kết mạng xã hội" });
    } catch (error) {
        logError("Delete social link failed", error, { requesterId: req.user?.id });
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};

export const reorderSocialLinks = async (req, res) => {
    try {
        if (!checkRole(req, res)) return;

        const items = Array.isArray(req.body?.items) ? req.body.items : [];
        if (items.length === 0) {
            return res.status(400).json({ success: false, message: "Danh sách thứ tự không hợp lệ" });
        }

        for (const item of items) {
            const id = Number(item.id);
            const order = Number(item.display_order);
            if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(order) || order < 0) continue;

            await db.query(
                "UPDATE social_links SET display_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
                [order, id]
            );
        }

        auditLog("REORDER_SOCIAL_LINKS", req.user?.id, { count: items.length }, req);

        return res.json({ success: true, message: "Đã cập nhật thứ tự hiển thị" });
    } catch (error) {
        logError("Reorder social links failed", error, { requesterId: req.user?.id });
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};
