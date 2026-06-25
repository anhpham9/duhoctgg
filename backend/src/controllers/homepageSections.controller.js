import db from "../config/db.js";
import { logError, logInfo } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { SecurityLogger } from "../utils/securityLogger.js";

const MANAGE_HOMEPAGE_SECTION_ROLES = [1, 2, 3];
const ALLOWED_TYPES = ["paragraph", "list", "card"];
const ALLOWED_CARD_LAYOUTS = ["bg-red", "bg-white", "border-top"];

const toJsonArray = (value) => {
    if (Array.isArray(value)) return value;

    if (typeof value === "string") {
        const raw = value.trim();
        if (!raw) return [];

        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    return [];
};

const normalizeListItems = (value) => {
    const rows = toJsonArray(value);

    return rows
        .map((item) => {
            if (typeof item === "string") return item.trim();
            if (item && typeof item === "object") return String(item.text || item.value || "").trim();
            return "";
        })
        .filter(Boolean);
};

const normalizeCardItems = (value) => {
    const rows = toJsonArray(value);

    return rows
        .map((item) => ({
            icon: InputSanitizer.sanitizeText(item?.icon || "", { maxLength: 120, escapeHtml: false }).trim(),
            title: InputSanitizer.sanitizeText(item?.title || "", { maxLength: 255, escapeHtml: false }).trim(),
            content: InputSanitizer.sanitizeText(item?.content || "", { maxLength: 2000, escapeHtml: false }).trim()
        }))
        .filter((item) => item.icon && item.title && item.content);
};

const parseBool = (value, fallback = false) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "true") return true;
        if (normalized === "false") return false;
    }
    return fallback;
};

const mapHomepageSectionRow = (row) => ({
    ...row,
    list_items: toJsonArray(row?.list_items),
    card_items: toJsonArray(row?.card_items)
});

const sanitizeHomepageSectionPayload = (payload = {}) => {
    const type = String(payload.type || "paragraph").trim().toLowerCase();
    const normalizedType = ALLOWED_TYPES.includes(type) ? type : "paragraph";

    const contactBtnShow = parseBool(payload.contact_btn_show, false);

    return {
        title: InputSanitizer.sanitizeText(payload.title || "", { maxLength: 255, escapeHtml: false }).trim(),
        subtitle: InputSanitizer.sanitizeText(payload.subtitle || "", { maxLength: 255, escapeHtml: false }).trim(),
        description: InputSanitizer.sanitizeText(payload.description || "", { maxLength: 4000, escapeHtml: false }).trim(),
        type: normalizedType,
        contact_btn_show: contactBtnShow,
        contact_btn_text: contactBtnShow
            ? InputSanitizer.sanitizeText(payload.contact_btn_text || "", { maxLength: 100, escapeHtml: false }).trim()
            : "",
        paragraph_text: InputSanitizer.sanitizeText(payload.paragraph_text || "", { maxLength: 10000, escapeHtml: false }).trim(),
        image_url: InputSanitizer.sanitizeText(payload.image_url || "", { maxLength: 2000, escapeHtml: false }).trim(),
        image_cloudinary_public_id: InputSanitizer.sanitizeText(payload.image_cloudinary_public_id || "", { maxLength: 255, escapeHtml: false }).trim(),
        image_position: Number(payload.image_position) === 0 ? 0 : 1,
        list_icon: InputSanitizer.sanitizeText(payload.list_icon || "", { maxLength: 100, escapeHtml: false }).trim(),
        list_items: normalizeListItems(payload.list_items),
        card_desktop_columns: Number.isFinite(Number(payload.card_desktop_columns)) ? Number(payload.card_desktop_columns) : 4,
        card_tablet_columns: Number.isFinite(Number(payload.card_tablet_columns)) ? Number(payload.card_tablet_columns) : 2,
        card_layout: ALLOWED_CARD_LAYOUTS.includes(String(payload.card_layout || "").trim())
            ? String(payload.card_layout || "").trim()
            : "bg-red",
        card_items: normalizeCardItems(payload.card_items),
        sort_order: Number.isFinite(Number(payload.sort_order)) ? Number(payload.sort_order) : 0,
        is_active: parseBool(payload.is_active, true)
    };
};

const validateHomepageSectionPayload = (payload) => {
    if (!payload.title) return "Tiêu đề section là bắt buộc";
    if (!payload.subtitle) return "Subtitle section là bắt buộc";

    if (payload.contact_btn_show && !payload.contact_btn_text) {
        return "Bạn cần nhập text nút tư vấn khi bật hiển thị nút";
    }

    if (payload.type === "paragraph") {
        if (!payload.paragraph_text && !payload.image_url) {
            return "Section paragraph cần paragraph_text hoặc image_url";
        }
    }

    if (payload.type === "list") {
        if (!payload.list_icon) return "Section list bắt buộc có list_icon";
        if (!payload.list_items.length) return "Section list phải có ít nhất 1 dòng";
    }

    if (payload.type === "card") {
        if (payload.card_desktop_columns < 1 || payload.card_desktop_columns > 6) {
            return "Section card chỉ cho phép desktop columns từ 1 đến 6";
        }
        if (payload.card_tablet_columns < 1 || payload.card_tablet_columns > 4) {
            return "Section card chỉ cho phép tablet columns từ 1 đến 4";
        }
        if (!payload.card_items.length) return "Section card phải có ít nhất 1 card";
    }

    return null;
};

const buildTypeSpecificData = (payload) => {
    if (payload.type === "paragraph") {
        return {
            paragraph_text: payload.paragraph_text,
            image_url: payload.image_url,
            image_cloudinary_public_id: payload.image_cloudinary_public_id,
            image_position: payload.image_position,
            list_icon: "",
            list_items: [],
            card_desktop_columns: payload.card_desktop_columns,
            card_tablet_columns: payload.card_tablet_columns,
            card_layout: payload.card_layout,
            card_items: []
        };
    }

    if (payload.type === "list") {
        return {
            paragraph_text: payload.paragraph_text,
            image_url: payload.image_url,
            image_cloudinary_public_id: payload.image_cloudinary_public_id,
            image_position: payload.image_position,
            list_icon: payload.list_icon,
            list_items: payload.list_items,
            card_desktop_columns: payload.card_desktop_columns,
            card_tablet_columns: payload.card_tablet_columns,
            card_layout: payload.card_layout,
            card_items: []
        };
    }

    return {
        paragraph_text: "",
        image_url: "",
        image_cloudinary_public_id: "",
        image_position: payload.image_position,
        list_icon: "",
        list_items: [],
        card_desktop_columns: payload.card_desktop_columns,
        card_tablet_columns: payload.card_tablet_columns,
        card_layout: payload.card_layout,
        card_items: payload.card_items
    };
};

export const getHomepageSectionsAdmin = async (req, res) => {
    try {
        if (!MANAGE_HOMEPAGE_SECTION_ROLES.includes(req.user?.role_id)) {
            SecurityLogger.logPermissionViolation(
                req.user?.id,
                req.ip,
                "/api/homepage-sections",
                "GET",
                "homepage_sections.view"
            );

            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions to view homepage sections."
            });
        }

        const result = await db.query(
            `SELECT id, title, subtitle, type, description, contact_btn_show, contact_btn_text,
                    paragraph_text, image_url, image_cloudinary_public_id, image_position, list_icon, list_items,
                    card_desktop_columns, card_tablet_columns, card_layout, card_items, sort_order, is_active, created_at, updated_at
             FROM homepage_sections
             ORDER BY sort_order ASC, id ASC`
        );

        res.json({
            success: true,
            data: (result.rows || []).map(mapHomepageSectionRow),
            message: "Lấy danh sách homepage sections thành công"
        });
    } catch (error) {
        logError("Get homepage sections admin failed", error, { requesterId: req.user?.id });
        res.status(500).json({ success: false, message: "Không thể lấy danh sách section" });
    }
};

export const getHomepageSectionsPublic = async (_req, res) => {
    try {
        const result = await db.query(
            `SELECT id, title, subtitle, type, description, contact_btn_show, contact_btn_text,
                    paragraph_text, image_url, image_position, list_icon, list_items,
                    card_desktop_columns, card_tablet_columns, card_layout, card_items, sort_order
             FROM homepage_sections
             WHERE is_active = true
             ORDER BY sort_order ASC, id ASC`
        );

        res.json({
            success: true,
            data: (result.rows || []).map(mapHomepageSectionRow),
            message: "Lấy homepage sections thành công"
        });
    } catch (error) {
        logError("Get homepage sections public failed", error);
        res.status(500).json({ success: false, message: "Không thể lấy section trang chủ" });
    }
};

export const createHomepageSection = async (req, res) => {
    try {
        if (!MANAGE_HOMEPAGE_SECTION_ROLES.includes(req.user?.role_id)) {
            SecurityLogger.logPermissionViolation(
                req.user?.id,
                req.ip,
                "/api/homepage-sections",
                "POST",
                "homepage_sections.create"
            );

            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions to create homepage sections."
            });
        }

        const normalized = sanitizeHomepageSectionPayload(req.body);
        const validationError = validateHomepageSectionPayload(normalized);
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError, errors: { validation: validationError } });
        }

        const typeData = buildTypeSpecificData(normalized);

        const result = await db.query(
            `INSERT INTO homepage_sections (
                title, subtitle, type, description,
                contact_btn_show, contact_btn_text,
                paragraph_text, image_url, image_cloudinary_public_id, image_position,
                list_icon, list_items,
                card_desktop_columns, card_tablet_columns, card_layout, card_items,
                sort_order, is_active
            ) VALUES (
                $1, $2, $3, $4,
                $5, $6,
                $7, $8, $9, $10,
                $11, $12,
                $13, $14, $15, $16,
                $17, $18
            ) RETURNING *`,
            [
                normalized.title,
                normalized.subtitle,
                normalized.type,
                normalized.description,
                normalized.contact_btn_show,
                normalized.contact_btn_text,
                typeData.paragraph_text,
                typeData.image_url,
                typeData.image_cloudinary_public_id,
                typeData.image_position,
                typeData.list_icon,
                JSON.stringify(typeData.list_items),
                typeData.card_desktop_columns,
                typeData.card_tablet_columns,
                typeData.card_layout,
                JSON.stringify(typeData.card_items),
                normalized.sort_order,
                normalized.is_active
            ]
        );

        logInfo("HOMEPAGE_SECTION_CREATE", { sectionId: result.rows[0].id, userId: req.user?.id });

        res.status(201).json({
            success: true,
            data: mapHomepageSectionRow(result.rows[0]),
            message: "Tạo section thành công"
        });
    } catch (error) {
        logError("Create homepage section failed", error, { userId: req.user?.id });
        res.status(500).json({ success: false, message: "Không thể tạo section" });
    }
};

export const updateHomepageSection = async (req, res) => {
    try {
        if (!MANAGE_HOMEPAGE_SECTION_ROLES.includes(req.user?.role_id)) {
            SecurityLogger.logPermissionViolation(
                req.user?.id,
                req.ip,
                `/api/homepage-sections/${req.params.id}`,
                "PUT",
                "homepage_sections.update"
            );

            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions to update homepage sections."
            });
        }

        const sectionId = Number(req.params.id);
        if (!Number.isInteger(sectionId) || sectionId <= 0) {
            return res.status(400).json({ success: false, message: "ID section không hợp lệ" });
        }

        const existing = await db.query("SELECT id FROM homepage_sections WHERE id = $1", [sectionId]);
        if (!existing.rows.length) {
            return res.status(404).json({ success: false, message: "Không tìm thấy section" });
        }

        const normalized = sanitizeHomepageSectionPayload(req.body);
        const validationError = validateHomepageSectionPayload(normalized);
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError, errors: { validation: validationError } });
        }

        const typeData = buildTypeSpecificData(normalized);

        const result = await db.query(
            `UPDATE homepage_sections SET
                title = $1,
                subtitle = $2,
                type = $3,
                description = $4,
                contact_btn_show = $5,
                contact_btn_text = $6,
                paragraph_text = $7,
                image_url = $8,
                image_cloudinary_public_id = $9,
                image_position = $10,
                list_icon = $11,
                list_items = $12,
                card_desktop_columns = $13,
                card_tablet_columns = $14,
                card_layout = $15,
                card_items = $16,
                sort_order = $17,
                is_active = $18,
                updated_at = NOW()
             WHERE id = $19
             RETURNING *`,
            [
                normalized.title,
                normalized.subtitle,
                normalized.type,
                normalized.description,
                normalized.contact_btn_show,
                normalized.contact_btn_text,
                typeData.paragraph_text,
                typeData.image_url,
                typeData.image_cloudinary_public_id,
                typeData.image_position,
                typeData.list_icon,
                JSON.stringify(typeData.list_items),
                typeData.card_desktop_columns,
                typeData.card_tablet_columns,
                typeData.card_layout,
                JSON.stringify(typeData.card_items),
                normalized.sort_order,
                normalized.is_active,
                sectionId
            ]
        );

        logInfo("HOMEPAGE_SECTION_UPDATE", { sectionId, userId: req.user?.id });

        res.json({
            success: true,
            data: mapHomepageSectionRow(result.rows[0]),
            message: "Cập nhật section thành công"
        });
    } catch (error) {
        logError("Update homepage section failed", error, { userId: req.user?.id, sectionId: req.params.id });
        res.status(500).json({ success: false, message: "Không thể cập nhật section" });
    }
};

export const deleteHomepageSection = async (req, res) => {
    try {
        if (!MANAGE_HOMEPAGE_SECTION_ROLES.includes(req.user?.role_id)) {
            SecurityLogger.logPermissionViolation(
                req.user?.id,
                req.ip,
                `/api/homepage-sections/${req.params.id}`,
                "DELETE",
                "homepage_sections.delete"
            );

            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions to delete homepage sections."
            });
        }

        const sectionId = Number(req.params.id);
        if (!Number.isInteger(sectionId) || sectionId <= 0) {
            return res.status(400).json({ success: false, message: "ID section không hợp lệ" });
        }

        const result = await db.query("DELETE FROM homepage_sections WHERE id = $1 RETURNING id", [sectionId]);
        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Không tìm thấy section" });
        }

        logInfo("HOMEPAGE_SECTION_DELETE", { sectionId, userId: req.user?.id });

        res.json({ success: true, message: "Xóa section thành công" });
    } catch (error) {
        logError("Delete homepage section failed", error, { userId: req.user?.id, sectionId: req.params.id });
        res.status(500).json({ success: false, message: "Không thể xóa section" });
    }
};
